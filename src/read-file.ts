import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { TerminalExtensionConfiguration } from "./types/types";

export async function getTerminalManagerConfig(): Promise<TerminalExtensionConfiguration | null> {
  // 1. Try reading configuration from workspace settings.json
  const config = vscode.workspace.getConfiguration("terminalManager");
  const workspaceConfig: TerminalExtensionConfiguration | undefined =
    config.get("config");

  if (workspaceConfig) {
    console.log("[TerminalManager] Config found in workspace settings.json");
    return workspaceConfig;
  }

  console.log(
    "[TerminalManager] No config in settings.json, searching for terminal-manager.json..."
  );

  // 2. Determine project root folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  let basePath: string;

  if (workspaceFolders && workspaceFolders.length > 0) {
    basePath = workspaceFolders[0].uri.fsPath;
  } else if (vscode.workspace.workspaceFile) {
    basePath = path.dirname(vscode.workspace.workspaceFile.fsPath);
  } else {
    console.warn(
      "[TerminalManager] No workspace folders found, using current working directory as base path."
    );
    basePath = process.cwd();
  }

  // 3. Manual path provided by user (if any)
  const manualPath = config.get<string>("path");

  // 3.1 If user provided a manual path → try that first
  if (manualPath && manualPath.trim() !== "") {
    const resolvedPath = path.isAbsolute(manualPath)
      ? manualPath
      : path.join(basePath, manualPath);

    console.log(
      "[TerminalManager] Trying to load config from manual path:",
      resolvedPath
    );

    if (fs.existsSync(resolvedPath)) {
      try {
        const data: TerminalExtensionConfiguration = JSON.parse(
          fs.readFileSync(resolvedPath, "utf8")
        );
        return data;
      } catch (err) {
        console.error(
          "[TerminalManager] Error reading manual config file:",
          err
        );
      }
    } else {
      console.warn("[TerminalManager] Manual config file does not exist.");
    }
  }

  // 4. Search for terminal-manager.json inside .vscode/
  const autoJsonPath = path.join(basePath, ".vscode", "terminal-manager.json");
  console.log("[TerminalManager] Searching for file at:", autoJsonPath);

  if (fs.existsSync(autoJsonPath)) {
    try {
      const data: TerminalExtensionConfiguration = JSON.parse(
        fs.readFileSync(autoJsonPath, "utf8")
      );
      console.log("[TerminalManager] Config found in terminal-manager.json");
      return data;
    } catch (err) {
      console.error(
        "[TerminalManager] Error reading terminal-manager.json:",
        err
      );
    }
  } else {
    console.warn(
      "[TerminalManager] terminal-manager.json not found inside .vscode/"
    );
  }

  console.log("[TerminalManager] No valid configuration found.");
  return null;
}
