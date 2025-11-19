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

  terminalToShow?.show();
};

export const createTerminal = (
  terminalConfig: TerminalOptions,
  index: number
) => {
  const cwd = resolveTerminalPath(terminalConfig.initialPath);
  const name = terminalConfig.name || `terminal-${index}`;

  // Verificar si el terminal ya existe
  if (vscode.window.terminals.find((terminal) => terminal.name === name)) {
    vscode.window.showInformationMessage(
      `Omitted terminal with name ${name}, because it already exists`
    );
    return;
  }

  // Crear el terminal
  const terminal = vscode.window.createTerminal({
    cwd,
    shellPath: terminalConfig.shellPath,
    name,
  });

  // Ejecutar comandos si existen
  if (terminalConfig.commands && terminalConfig.commands.length > 0) {
    for (const command of terminalConfig.commands) {
      terminal.sendText(command);
    }
  }
};

/**
 * Resuelve la ruta del terminal basándose en el initialPath
 * Soporta:
 * - Rutas absolutas
 * - Nombres de workspace folders (e.g., "test-project")
 * - Rutas relativas con ./ (e.g., "./test-project")
 * - undefined (usa el primer workspace folder)
 */
function resolveTerminalPath(initialPath: string | undefined): string {
  const workspaceFolders = vscode.workspace.workspaceFolders || [];

  // Si no hay initialPath, usar el primer workspace folder
  if (!initialPath) {
    if (workspaceFolders.length > 0) {
      return workspaceFolders[0].uri.fsPath;
    }
    vscode.window.showWarningMessage(
      `[Terminal Manager] No workspace folder found. Using process.cwd() as fallback.`
    );
    return process.cwd();
  }

  // Si es ruta absoluta, usarla directamente
  if (path.isAbsolute(initialPath)) {
    return initialPath;
  }

  // Remover ./ o .\ si existe
  let cleanPath = initialPath;
  if (initialPath.startsWith("./") || initialPath.startsWith(".\\")) {
    cleanPath = initialPath.substring(2);
  }

  // Buscar workspace folder que coincida con el nombre
  const matchingFolder = workspaceFolders.find((folder) => {
    const folderName = path.basename(folder.uri.fsPath);
    return (
      folderName === cleanPath ||
      folder.uri.fsPath.endsWith(path.sep + cleanPath)
    );
  });

  if (matchingFolder) {
    console.log(
      `[Terminal Manager] Resolved "${initialPath}" to workspace folder: ${matchingFolder.uri.fsPath}`
    );
    return matchingFolder.uri.fsPath;
  }

  // Si no se encuentra, resolver desde el directorio del workspace file
  if (vscode.workspace.workspaceFile) {
    const workspaceDir = path.dirname(vscode.workspace.workspaceFile.fsPath);
    const resolvedPath = path.resolve(workspaceDir, cleanPath);
    console.log(
      `[Terminal Manager] Resolved "${initialPath}" relative to workspace file: ${resolvedPath}`
    );
    return resolvedPath;
  }

  // Último fallback: resolver desde el primer workspace folder
  if (workspaceFolders.length > 0) {
    const resolvedPath = path.resolve(
      workspaceFolders[0].uri.fsPath,
      cleanPath
    );
    console.log(
      `[Terminal Manager] Resolved "${initialPath}" relative to first workspace folder: ${resolvedPath}`
    );
    return resolvedPath;
  }

  // Si nada funciona, usar process.cwd()
  vscode.window.showWarningMessage(
    `[Terminal Manager] Could not resolve path "${initialPath}". Using process.cwd() as fallback.`
  );
  return process.cwd();
}
