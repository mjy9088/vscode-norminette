'use strict';

import { spawn } from 'child_process';

import * as vscode from 'vscode';

interface Error {
  title: string;
  message: string;
  line: number;
  column: number;
  severity: vscode.DiagnosticSeverity;
}

const re =
  /^(Notice|Error): (\w+)\s*\(line:\s*(\d+),\s*col:\s*(\d+)\):\s*(.*)$/gm;

export default class NorminetteLint implements vscode.CodeActionProvider {
  diagnostics: vscode.DiagnosticCollection;
  enabled: boolean;

  static init(context: vscode.ExtensionContext): NorminetteLint {
    return new NorminetteLint(context);
  }

  constructor(context: vscode.ExtensionContext) {
    let subscriptions: vscode.Disposable[] = context.subscriptions;
    this.diagnostics =
      vscode.languages.createDiagnosticCollection('norminette');
    this.enabled = true;

    vscode.commands.registerCommand(
      'vscode-norminette.toggle',
      this.toggle.bind(this),
    );
    subscriptions.push(this);

    vscode.workspace.onDidSaveTextDocument(this.runLint, this, subscriptions);

    vscode.workspace.onDidCloseTextDocument(
      this.clearLint,
      this,
      subscriptions,
    );
  }

  public provideCodeActions(
    _document: vscode.TextDocument,
    _range: vscode.Range,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken,
  ): vscode.Command[] {
    return [];
  }

  public clearLint() {
    this.diagnostics.clear();
  }

  public runLint(document: vscode.TextDocument) {
    if (!this.enabled) {
      return;
    }
    const command =
      vscode.workspace
        .getConfiguration('vscode-norminette')
        .get<string>('command') || 'norminette';
    const args =
      vscode.workspace
        .getConfiguration('vscode-norminette')
        .get<string[]>('args') || [];
    const stream = spawn(command, [...args, '--', document.fileName], {
      stdio: 'pipe',
      shell: false,
    });
    let output = '';
    stream.stdout.on('data', function (data) {
      output += data.toString();
    });
    stream.on('close', () => {
      this.showDiagnostics(document, NorminetteLint.parseStdout(output));
    });
  }

  public toggle() {
    this.enabled = !this.enabled;
    if (this.enabled && vscode.window.activeTextEditor) {
      this.runLint(vscode.window.activeTextEditor.document);
    } else {
      this.clearLint();
    }
  }

  private static parseStdout(stdout: string): Error[] {
    return (stdout.match(re) || []).map<Error>((l) => {
      const [, severity, title, line, col, message] = re.exec(l)!;
      return {
        title,
        message,
        line: parseInt(line, 10),
        column: parseInt(col, 10),
        severity:
          severity === 'Notice'
            ? vscode.DiagnosticSeverity.Information
            : vscode.DiagnosticSeverity.Error,
      };
    });
  }

  private showDiagnostics(
    document: vscode.TextDocument,
    errors: Error[],
  ): void {
    this.diagnostics.set(
      document.uri,
      errors.map(
        (err) =>
          new vscode.Diagnostic(
            new vscode.Range(
              err.line - 1,
              err.column,
              err.line - 1,
              err.column + 1,
            ),
            `${err.message} (${err.title})`,
            err.severity,
          ),
      ),
    );
  }

  public dispose() {
    this.diagnostics.clear();
    this.diagnostics.dispose();
  }
}
