/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { EditorType } from '../utils/editor.js';
import { openDiff } from '../utils/editor.js';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import * as Diff from 'diff';
import { DEFAULT_DIFF_OPTIONS } from './diffOptions.js';
import { isNodeError } from '../utils/errors.js';
import type {
  AnyDeclarativeTool,
  DeclarativeTool,
  ToolResult,
} from './tools.js';

/**
 * A declarative tool that supports a modify operation.
 */
export interface ModifiableDeclarativeTool<TParams extends object>
  extends DeclarativeTool<TParams, ToolResult> {
  getModifyContext(abortSignal: AbortSignal): ModifyContext<TParams>;
}

export interface ModifyContext<ToolParams> {
  getFilePath: (params: ToolParams) => string;

  getCurrentContent: (params: ToolParams) => Promise<string>;

  getProposedContent: (params: ToolParams) => Promise<string>;

  createUpdatedParams: (
    oldContent: string,
    modifiedProposedContent: string,
    originalParams: ToolParams,
  ) => ToolParams;
}

export interface ModifyResult<ToolParams> {
  updatedParams: ToolParams;
  updatedDiff: string;
}

/**
 * Type guard to check if a declarative tool is modifiable.
 */
export function isModifiableDeclarativeTool(
  tool: AnyDeclarativeTool,
): tool is ModifiableDeclarativeTool<object> {
  return 'getModifyContext' in tool;
}

function createTempFilesForModify(
  currentContent: string,
  proposedContent: string,
  file_path: string,
): { oldPath: string; newPath: string } {
  const tempDir = os.tmpdir();
  const diffDir = path.join(tempDir, 'gemini-cli-tool-modify-diffs');

  if (!fs.existsSync(diffDir)) {
    fs.mkdirSync(diffDir, { recursive: true });
  }

  const ext = path.extname(file_path);
  const fileName = path.basename(file_path, ext);
  const timestamp = Date.now();
  const tempOldPath = path.join(
    diffDir,
    `gemini-cli-modify-${fileName}-old-${timestamp}${ext}`,
  );
  const tempNewPath = path.join(
    diffDir,
    `gemini-cli-modify-${fileName}-new-${timestamp}${ext}`,
  );

  fs.writeFileSync(tempOldPath, currentContent, 'utf8');
  fs.writeFileSync(tempNewPath, proposedContent, 'utf8');

  return { oldPath: tempOldPath, newPath: tempNewPath };
}

function getUpdatedParams<ToolParams>(
  tmpOldPath: string,
  tempNewPath: string,
  originalParams: ToolParams,
  modifyContext: ModifyContext<ToolParams>,
): { updatedParams: ToolParams; updatedDiff: string } {
  let oldContent = '';
  let newContent = '';

  try {
    oldContent = fs.readFileSync(tmpOldPath, 'utf8');
  } catch (err) {
    if (!isNodeError(err) || err.code !== 'ENOENT') throw err;
    oldContent = '';
  }

  try {
    newContent = fs.readFileSync(tempNewPath, 'utf8');
  } catch (err) {
    if (!isNodeError(err) || err.code !== 'ENOENT') throw err;
    newContent = '';
  }

  const updatedParams = modifyContext.createUpdatedParams(
    oldContent,
    newContent,
    originalParams,
  );
  const updatedDiff = Diff.createPatch(
    path.basename(modifyContext.getFilePath(originalParams)),
    oldContent,
    newContent,
    'Current',
    'Proposed',
    DEFAULT_DIFF_OPTIONS,
  );

  return { updatedParams, updatedDiff };
}

function deleteTempFiles(oldPath: string, newPath: string): void {
  try {
    fs.unlinkSync(oldPath);
  } catch {
    console.error(`Error deleting temp diff file: ${oldPath}`);
  }

  try {
    fs.unlinkSync(newPath);
  } catch {
    console.error(`Error deleting temp diff file: ${newPath}`);
  }
}

/**
 * Triggers an external editor for the user to modify the proposed content,
 * and returns the updated tool parameters and the diff after the user has modified the proposed content.
 */
export async function modifyWithEditor<ToolParams>(
  originalParams: ToolParams,
  modifyContext: ModifyContext<ToolParams>,
  editorType: EditorType,
  _abortSignal: AbortSignal,
  onEditorClose: () => void,
): Promise<ModifyResult<ToolParams>> {
  const currentContent = await modifyContext.getCurrentContent(originalParams);
  const proposedContent =
    await modifyContext.getProposedContent(originalParams);

  const { oldPath, newPath } = createTempFilesForModify(
    currentContent,
    proposedContent,
    modifyContext.getFilePath(originalParams),
  );

  try {
    await openDiff(oldPath, newPath, editorType, onEditorClose);
    const result = getUpdatedParams(
      oldPath,
      newPath,
      originalParams,
      modifyContext,
    );

    return result;
  } finally {
    deleteTempFiles(oldPath, newPath);
  }
}
