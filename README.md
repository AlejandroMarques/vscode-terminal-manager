[![banner.png](https://i.postimg.cc/3wT3J4Zy/banner.png)](https://postimg.cc/K1J60YwF)

# TERMINAL MANAGER

Terminal Manager automatically creates and manages multiple VS Code terminals based on a JSON configuration file or workspace settings. It simplifies running development scripts or commands by pre-configuring terminals with custom paths, shells, and commands.

## Features

- Create multiple terminals automatically when a project or workspace opens
- Run custom commands in each terminal
- Support for relative and absolute paths
- Custom shell executable per terminal
- Focus on a specific terminal after creation
- Manual execution via Command Palette
- Multi-root workspace support with intelligent path resolution

## Installation

Install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/) or clone the repository to inspect the code.

## Configuration

The extension can be configured in **two ways**:

### 1. JSON configuration file

Create a file `.vscode/terminal-manager.json` at the root of your project.

You can also specify a **custom path** for the configuration file in the settings:

```json
{
  "terminalManager.configPath": "./config/terminal-manager.json"
}
```

If no manual path is provided, the extension will look for `.vscode/terminal-manager.json` by default.

Example configuration file at the default location:

```json
{
  "terminals": [
    {
      "name": "Backend",
      "initialPath": "./backend",
      "commands": ["npm run dev"],
      "shellPath": "C:\\Program Files\\Git\\bin\\bash.exe"
    },
    {
      "name": "Frontend",
      "initialPath": "./frontend",
      "commands": ["npm start"]
    }
  ],
  "focusOnTerminal": "Backend",
  "runAutomatically": true
}
```

---

### 2. Workspace or User Settings

You can also configure via `settings.json` or `.code-workspace`:

```json
{
  "terminalManager.configPath": "./config/terminal-manager.json",
  "terminalManager.terminals": [
    {
      "name": "Backend",
      "initialPath": "./backend",
      "commands": ["npm run dev"]
    }
  ],
  "terminalManager.focusOnTerminal": "Backend",
  "terminalManager.runAutomatically": true
}
```

#### Multi-Root Workspace Example

For workspaces with multiple folders, you can reference workspace folders by name:

```json
{
  "folders": [
    {
      "path": "./test-project"
    },
    {
      "path": "./test-project-2"
    }
  ],
  "settings": {
    "terminalManager.terminals": [
      {
        "name": "Project 1",
        "initialPath": "test-project",
        "commands": ["npm install", "npm run dev"]
      },
      {
        "name": "Project 2",
        "initialPath": "test-project-2",
        "commands": ["npm start"]
      }
    ],
    "terminalManager.focusOnTerminal": "Project 1",
    "terminalManager.runAutomatically": true
  }
}
```

---

## Configuration Options

| Option                        | Type                | Required | Description                                                                                                              |
| ----------------------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `terminals`                   | `TerminalOptions[]` | ✅       | List of terminals to create. Each terminal supports optional properties: `name`, `initialPath`, `shellPath`, `commands`. |
| `TerminalOptions.name`        | `string`            | ❌       | Terminal name. Defaults to `terminal-<index>`.                                                                           |
| `TerminalOptions.initialPath` | `string`            | ❌       | Working directory for the terminal. See [Path Resolution](#path-resolution) below. Defaults to project root.             |
| `TerminalOptions.shellPath`   | `string`            | ❌       | Custom shell executable. Defaults to VS Code default shell.                                                              |
| `TerminalOptions.commands`    | `string[]`          | ❌       | Commands to run on terminal creation.                                                                                    |
| `focusOnTerminal`             | `string \| number`  | ❌       | Terminal to focus after creation (name or index). Defaults to last terminal.                                             |
| `runAutomatically`            | `boolean`           | ❌       | Whether terminals should be created automatically when the workspace opens. Defaults to `false`.                         |

### Path Resolution

The `initialPath` property supports multiple formats:

1. **Absolute paths**: Used directly

   ```json
   "initialPath": "C:\\Users\\MyUser\\Projects\\backend"
   ```

2. **Relative paths with `./`**: Resolved relative to the project root or workspace file location

   ```json
   "initialPath": "./backend"
   ```

3. **Workspace folder names** (recommended for multi-root workspaces): References a workspace folder by its name
   ```json
   "initialPath": "test-project"
   ```

For multi-root workspaces, the extension intelligently matches workspace folders by name, making it easy to target specific projects.

---

## Usage

### Automatic Terminal Creation

If `runAutomatically` is set to `true`, terminals will be created automatically when the project or workspace opens.

### Manual Terminal Creation

At any time, you can create the terminals manually:

1. Open **Command Palette** (`F1` or `Ctrl+Shift+P`)
2. Search for **[Terminal Manager]: Run Terminals**
3. Execute it to create terminals based on the current configuration.

---

## Multi-Root Workspace

For workspaces with multiple folders:

- **Workspace folder matching**: You can reference workspace folders by their folder name (e.g., `"initialPath": "backend"`)
- **Relative path resolution**: Paths starting with `./` are resolved relative to the workspace file location
- **Absolute paths**: Always respected regardless of workspace structure
- **Smart fallbacks**: If a path cannot be resolved, the extension falls back to the first workspace folder

### Example Multi-Root Setup

Project structure:

```
workspace-root/
├─ my-workspace.code-workspace
├─ backend/
│  └─ package.json
└─ frontend/
   └─ package.json
```

Configuration in `my-workspace.code-workspace`:

```json
{
  "folders": [{ "path": "./backend" }, { "path": "./frontend" }],
  "settings": {
    "terminalManager.terminals": [
      {
        "name": "Backend Server",
        "initialPath": "backend",
        "commands": ["npm run dev"]
      },
      {
        "name": "Frontend App",
        "initialPath": "frontend",
        "commands": ["npm start"]
      }
    ],
    "terminalManager.runAutomatically": true
  }
}
```

Result:

- **Backend Server** terminal opens in `workspace-root/backend/` and runs `npm run dev`
- **Frontend App** terminal opens in `workspace-root/frontend/` and runs `npm start`

---

## Visual Example

Suppose your project structure is:

```
project-root/
├─ .vscode/
│  └─ terminal-manager.json
├─ backend/
│  └─ package.json
└─ frontend/
   └─ package.json
```

With the configuration in `.vscode/terminal-manager.json`:

```json
{
  "terminals": [
    {
      "name": "Backend",
      "initialPath": "./backend",
      "commands": ["npm run dev"]
    },
    {
      "name": "Frontend",
      "initialPath": "./frontend",
      "commands": ["npm start"]
    }
  ],
  "focusOnTerminal": "Backend",
  "runAutomatically": true
}
```

Result:

- A terminal named **Backend** will open in `project-root/backend` and run `npm run dev`
- A terminal named **Frontend** will open in `project-root/frontend` and run `npm start`
- The **Backend** terminal will be focused automatically after creation

---

## Notes

- **Path resolution**: Relative paths are resolved intelligently based on context (project root, workspace file location, or workspace folder names)
- **Duplicate prevention**: If a terminal with the same name already exists, it won't be recreated
- **Focus customization**: You can focus on any terminal by name or index after creation
- **Manual execution**: Terminals can be recreated at any time without reopening the workspace
- **Absolute paths**: Fully supported, allowing you to open terminals anywhere on your system
- **Multi-root support**: Works seamlessly with multi-root workspaces using folder name matching

---

## License

[MIT](LICENSE)
