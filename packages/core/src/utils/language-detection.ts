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

import * as path from 'node:path';

const extensionToLanguageMap: { [key: string]: string } = {
  '.ts': 'TypeScript',
  '.js': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.jsx': 'JavaScript',
  '.tsx': 'TypeScript',
  '.py': 'Python',
  '.java': 'Java',
  '.go': 'Go',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.phtml': 'PHP',
  '.cs': 'C#',
  '.cpp': 'C++',
  '.cxx': 'C++',
  '.cc': 'C++',
  '.c': 'C',
  '.h': 'C/C++',
  '.hpp': 'C++',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.rs': 'Rust',
  '.m': 'Objective-C',
  '.mm': 'Objective-C',
  '.pl': 'Perl',
  '.pm': 'Perl',
  '.lua': 'Lua',
  '.r': 'R',
  '.scala': 'Scala',
  '.sc': 'Scala',
  '.sh': 'Shell',
  '.ps1': 'PowerShell',
  '.bat': 'Batch',
  '.cmd': 'Batch',
  '.sql': 'SQL',
  '.html': 'HTML',
  '.htm': 'HTML',
  '.css': 'CSS',
  '.less': 'Less',
  '.sass': 'Sass',
  '.scss': 'Sass',
  '.json': 'JSON',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.md': 'Markdown',
  '.markdown': 'Markdown',
  '.dockerfile': 'Dockerfile',
  '.vim': 'Vim script',
  '.vb': 'Visual Basic',
  '.fs': 'F#',
  '.clj': 'Clojure',
  '.cljs': 'Clojure',
  '.dart': 'Dart',
  '.ex': 'Elixir',
  '.erl': 'Erlang',
  '.hs': 'Haskell',
  '.lisp': 'Lisp',
  '.rkt': 'Racket',
  '.groovy': 'Groovy',
  '.jl': 'Julia',
  '.tex': 'LaTeX',
  '.ino': 'Arduino',
  '.asm': 'Assembly',
  '.s': 'Assembly',
  '.toml': 'TOML',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.gohtml': 'Go Template',
  '.hbs': 'Handlebars',
  '.ejs': 'EJS',
  '.erb': 'ERB',
  '.jsp': 'JSP',
  '.dockerignore': 'Docker',
  '.gitignore': 'Git',
  '.npmignore': 'npm',
  '.editorconfig': 'EditorConfig',
  '.prettierrc': 'Prettier',
  '.eslintrc': 'ESLint',
  '.babelrc': 'Babel',
  '.tsconfig': 'TypeScript',
  '.flow': 'Flow',
  '.graphql': 'GraphQL',
  '.proto': 'Protocol Buffers',
};

export function getLanguageFromFilePath(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  if (extension) {
    return extensionToLanguageMap[extension];
  }
  const filename = path.basename(filePath).toLowerCase();
  return extensionToLanguageMap[`.${filename}`];
}
