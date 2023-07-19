import * as vscode from 'vscode';

interface Instruction {
  definition: string;
  explanation: string;
  displayName: string;
  variants?: InstructionSet;
}

/** TODO:NOW */
export type InstructionSet = Record<string, Instruction>;

/** TODO:NOW */
export declare interface Arm64Reference {
  instructions: Record<string, Instruction>;
  registers: Record<string, string>;
  flags: Record<string, string>;
}

/** TODO:NOW */
export async function loadInstructionSet(
  uri: vscode.Uri
): Promise<Arm64Reference> {
  const buffer = await vscode.workspace.fs.readFile(uri);
  return JSON.parse(buffer.toString());
}
