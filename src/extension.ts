import * as vscode from 'vscode';
import { loadInstructionSet } from './instruction_set';
import { TreeProvider } from './tree_provider';

import { INSTRUCTION_SET_URI } from './constants';

export async function activate(context: vscode.ExtensionContext) {
  const instructionSet = await loadInstructionSet(INSTRUCTION_SET_URI);

  context.subscriptions.push(
    new TreeProvider(instructionSet),
    vscode.commands.registerCommand('arm.view', (name, detail) => {
      vscode.window.showInformationMessage(name, { modal: true, detail });
    })
  );
}

export function deactivate() {}
