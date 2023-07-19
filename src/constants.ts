import * as path from 'path';
import * as vscode from 'vscode';

const DATA_URI = vscode.Uri.file(path.resolve(__dirname, 'data'));
export const INSTRUCTION_SET_URI = vscode.Uri.joinPath(
  DATA_URI,
  'arm64-reference.json'
);
