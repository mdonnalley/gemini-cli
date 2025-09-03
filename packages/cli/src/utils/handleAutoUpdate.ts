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

import type { UpdateObject } from '../ui/utils/updateCheck.js';
import type { LoadedSettings } from '../config/settings.js';
import { getInstallationInfo } from './installationInfo.js';
import { updateEventEmitter } from './updateEventEmitter.js';
import type { HistoryItem } from '../ui/types.js';
import { MessageType } from '../ui/types.js';
import { spawnWrapper } from './spawnWrapper.js';
import type { spawn } from 'node:child_process';

export function handleAutoUpdate(
  info: UpdateObject | null,
  settings: LoadedSettings,
  projectRoot: string,
  spawnFn: typeof spawn = spawnWrapper,
) {
  if (!info) {
    return;
  }

  if (settings.merged.general?.disableUpdateNag) {
    return;
  }

  const installationInfo = getInstallationInfo(
    projectRoot,
    settings.merged.general?.disableAutoUpdate ?? false,
  );

  let combinedMessage = info.message;
  if (installationInfo.updateMessage) {
    combinedMessage += `\n${installationInfo.updateMessage}`;
  }

  updateEventEmitter.emit('update-received', {
    message: combinedMessage,
  });

  if (
    !installationInfo.updateCommand ||
    settings.merged.general?.disableAutoUpdate
  ) {
    return;
  }
  const isNightly = info.update.latest.includes('nightly');

  const updateCommand = installationInfo.updateCommand.replace(
    '@latest',
    isNightly ? '@nightly' : `@${info.update.latest}`,
  );
  const updateProcess = spawnFn(updateCommand, { stdio: 'pipe', shell: true });
  let errorOutput = '';
  updateProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  updateProcess.on('close', (code) => {
    if (code === 0) {
      updateEventEmitter.emit('update-success', {
        message:
          'Update successful! The new version will be used on your next run.',
      });
    } else {
      updateEventEmitter.emit('update-failed', {
        message: `Automatic update failed. Please try updating manually. (command: ${updateCommand}, stderr: ${errorOutput.trim()})`,
      });
    }
  });

  updateProcess.on('error', (err) => {
    updateEventEmitter.emit('update-failed', {
      message: `Automatic update failed. Please try updating manually. (error: ${err.message})`,
    });
  });
  return updateProcess;
}

export function setUpdateHandler(
  addItem: (item: Omit<HistoryItem, 'id'>, timestamp: number) => void,
  setUpdateInfo: (info: UpdateObject | null) => void,
) {
  let successfullyInstalled = false;
  const handleUpdateRecieved = (info: UpdateObject) => {
    setUpdateInfo(info);
    const savedMessage = info.message;
    setTimeout(() => {
      if (!successfullyInstalled) {
        addItem(
          {
            type: MessageType.INFO,
            text: savedMessage,
          },
          Date.now(),
        );
      }
      setUpdateInfo(null);
    }, 60000);
  };

  const handleUpdateFailed = () => {
    setUpdateInfo(null);
    addItem(
      {
        type: MessageType.ERROR,
        text: `Automatic update failed. Please try updating manually`,
      },
      Date.now(),
    );
  };

  const handleUpdateSuccess = () => {
    successfullyInstalled = true;
    setUpdateInfo(null);
    addItem(
      {
        type: MessageType.INFO,
        text: `Update successful! The new version will be used on your next run.`,
      },
      Date.now(),
    );
  };

  const handleUpdateInfo = (data: { message: string }) => {
    addItem(
      {
        type: MessageType.INFO,
        text: data.message,
      },
      Date.now(),
    );
  };

  updateEventEmitter.on('update-received', handleUpdateRecieved);
  updateEventEmitter.on('update-failed', handleUpdateFailed);
  updateEventEmitter.on('update-success', handleUpdateSuccess);
  updateEventEmitter.on('update-info', handleUpdateInfo);

  return () => {
    updateEventEmitter.off('update-received', handleUpdateRecieved);
    updateEventEmitter.off('update-failed', handleUpdateFailed);
    updateEventEmitter.off('update-success', handleUpdateSuccess);
    updateEventEmitter.off('update-info', handleUpdateInfo);
  };
}
