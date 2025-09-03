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

/**
 * Terminal Platform Constants
 *
 * This file contains terminal-related constants used throughout the application,
 * specifically for handling keyboard inputs and terminal protocols.
 */

/**
 * Kitty keyboard protocol sequences for enhanced keyboard input.
 * @see https://sw.kovidgoyal.net/kitty/keyboard-protocol/
 */
export const KITTY_CTRL_C = '[99;5u';

/**
 * Kitty keyboard protocol keycodes
 */
export const KITTY_KEYCODE_ENTER = 13;
export const KITTY_KEYCODE_NUMPAD_ENTER = 57414;
export const KITTY_KEYCODE_TAB = 9;
export const KITTY_KEYCODE_BACKSPACE = 127;

/**
 * Timing constants for terminal interactions
 */
export const CTRL_EXIT_PROMPT_DURATION_MS = 1000;

/**
 * VS Code terminal integration constants
 */
export const VSCODE_SHIFT_ENTER_SEQUENCE = '\\\r\n';

/**
 * Backslash + Enter detection window in milliseconds.
 * Used to detect Shift+Enter pattern where backslash
 * is followed by Enter within this timeframe.
 */
export const BACKSLASH_ENTER_DETECTION_WINDOW_MS = 5;

/**
 * Maximum expected length of a Kitty keyboard protocol sequence.
 * Format: ESC [ <keycode> ; <modifiers> u/~
 * Example: \x1b[13;2u (Shift+Enter) = 8 chars
 * Longest reasonable: \x1b[127;15~ = 11 chars (Del with all modifiers)
 * We use 12 to provide a small buffer.
 */
export const MAX_KITTY_SEQUENCE_LENGTH = 12;

/**
 * Character codes for common escape sequences
 */
export const CHAR_CODE_ESC = 27;
export const CHAR_CODE_LEFT_BRACKET = 91;
export const CHAR_CODE_1 = 49;
export const CHAR_CODE_2 = 50;
