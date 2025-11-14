// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TerminalOptions } from "./types/types";
import { getTerminalManagerConfig } from "./read-file";
import { createTerminals } from "./create-terminals";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const config = await getTerminalManagerConfig();

  if (!config) {
    vscode.window.showErrorMessage("No configuration file found");
    return;
  }

  if (config.runAutomatically) {
    createTerminals(config);
  }

  const disposable = vscode.commands.registerCommand(
    "terminal-manager.runTerminals",
    async () => {
      const manualConfig = await getTerminalManagerConfig();

      if (!manualConfig) {
        vscode.window.showErrorMessage("No configuration file found");
        return;
      }

      createTerminals(manualConfig);
      vscode.window.showInformationMessage("Terminals created manually");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
