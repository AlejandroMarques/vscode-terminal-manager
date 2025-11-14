import path from "path";
import { TerminalExtensionConfiguration, TerminalOptions } from "./types/types";
import * as vscode from "vscode";

export const createTerminals = (config: TerminalExtensionConfiguration) => {
  config.terminals.forEach((terminalConfig: TerminalOptions, index) =>
    createTerminal(terminalConfig, index)
  );

  let terminalToShow: vscode.Terminal | undefined;

  if (config.focusOnTerminal) {
    terminalToShow = vscode.window.terminals.find(
      (terminal) => terminal.name === config.focusOnTerminal
    );
  }

  if (!terminalToShow) {
    terminalToShow =
      vscode.window.terminals[vscode.window.terminals.length - 1];
  }

  terminalToShow.show();
};

export const createTerminal = (
  terminalConfig: TerminalOptions,
  index: number
) => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const rootPath =
    workspaceFolders && workspaceFolders.length > 0
      ? workspaceFolders[0].uri.fsPath
      : undefined;

  if (!rootPath) {
    vscode.window.showWarningMessage(
      `[Terminal Manager] No workspace folder found. Using process.cwd() as fallback.`
    );
  }

  let cwd: string;
  if (terminalConfig.initialPath) {
    cwd = path.isAbsolute(terminalConfig.initialPath)
      ? terminalConfig.initialPath
      : rootPath
      ? path.resolve(rootPath, terminalConfig.initialPath)
      : process.cwd();
  } else {
    cwd = rootPath || process.cwd();
  }

  const name = terminalConfig.name || `terminal-${index}`;

  if (vscode.window.terminals.find((terminal) => terminal.name === name)) {
    vscode.window.showInformationMessage(
      `Ommited terminal with name ${name}, because it alredy exists`
    );
    return;
  }

  const terminal = vscode.window.createTerminal({
    cwd,
    shellPath: terminalConfig.shellPath,
    name,
  });

  if (terminalConfig.commands && terminalConfig.commands.length > 0) {
    for (const command of terminalConfig.commands) {
      terminal.sendText(command);
    }
  }
};
