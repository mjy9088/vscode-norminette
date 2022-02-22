import * as vscode from 'vscode';
import NorminetteLint from './NorminetteLint';

export function activate(context: vscode.ExtensionContext) {
  NorminetteLint.init(context);
}

export function deactivate() {}
