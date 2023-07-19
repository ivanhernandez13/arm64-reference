import * as vscode from 'vscode';
import { Arm64Reference, InstructionSet } from './instruction_set';

const CATEGORIES = ['instructions', 'registers', 'flags'] as const;
type Category = (typeof CATEGORIES)[number];

interface CategoryTreeItem {
  type: 'category';
  name: Category;
}

interface DescriptionTreeItem {
  type: 'description';
  definition: string;
  explanation: string;
}

interface InstructionTreeItem {
  type: 'instruction';
  name: string;
  displayName: string;
  definition: string;
  explanation: string;
  variants: InstructionVariantTreeItem[];
}

interface InstructionVariantTreeItem {
  type: 'variant';
  name: string;
  definition: string;
  explanation: string;
}

type TreeItem =
  | CategoryTreeItem
  | DescriptionTreeItem
  | InstructionTreeItem
  | InstructionVariantTreeItem;

type Dict = Record<string, string>;

function toInstructionTreeItem(
  instructions: InstructionSet,
  type: 'instruction'
): InstructionTreeItem[];
function toInstructionTreeItem(
  instructions: InstructionSet,
  type: 'variant'
): InstructionVariantTreeItem[];
function toInstructionTreeItem(
  instructions: InstructionSet,
  type: 'instruction' | 'variant'
): TreeItem[] {
  return Object.entries(instructions)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([name, instruction]) => ({
      type,
      name,
      displayName: instruction.displayName,
      definition: instruction.definition,
      explanation: `[ ${instruction.explanation} ]`,
      variants: instruction.variants
        ? toInstructionTreeItem(instruction.variants, 'variant')
        : [],
    }));
}

function toTreeDescriptionItem(dict: Dict): DescriptionTreeItem[] {
  return Object.entries(dict).map(([definition, explanation]) => ({
    type: 'description',
    definition,
    explanation,
  }));
}

export class TreeProvider
  implements vscode.TreeDataProvider<TreeItem>, vscode.Disposable
{
  private readonly items: { [c in Category]: TreeItem[] };

  constructor(ref: Arm64Reference) {
    this.items = {
      instructions: toInstructionTreeItem(ref.instructions, 'instruction'),
      registers: toTreeDescriptionItem(ref.registers),
      flags: toTreeDescriptionItem(ref.flags),
    };

    vscode.window.createTreeView('arm.assembly.tree', {
      treeDataProvider: this,
      showCollapseAll: true,
    });
  }

  getChildren(
    element?: TreeItem | undefined
  ): vscode.ProviderResult<TreeItem[]> {
    switch (element?.type) {
      case undefined:
        return CATEGORIES.map((c) => ({ type: 'category', name: c }));
      case 'category':
        return this.items[element.name];
      case 'instruction':
        const children: DescriptionTreeItem[] = element.variants.length
          ? element.variants.map((v) => ({
              type: 'description',
              definition: v.definition,
              explanation: v.explanation,
            }))
          : [];
        children.unshift({
          type: 'description',
          definition: element.definition,
          explanation: element.explanation,
        });
        return children;
      default:
        return [];
    }
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    let treeItem: vscode.TreeItem;
    switch (element.type) {
      case 'category':
        treeItem = new vscode.TreeItem(element.name);
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        treeItem.tooltip = '';
        break;
      case 'description':
        treeItem = new vscode.TreeItem(element.definition);
        treeItem.description = element.explanation;
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
        treeItem.tooltip = '';
        break;
      case 'instruction':
        treeItem = new vscode.TreeItem(element.name);
        treeItem.description = element.displayName;
        if (element.variants.length) {
          treeItem.description += ` (${[element.name]
            .concat(element.variants.map((v) => v.name))
            .join(', ')})`;
        }
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        treeItem.tooltip = `${element.definition} ${element.explanation}`;
        break;
      default:
        throw new Error('1');
    }

    return treeItem;
  }

  dispose() {}
}
