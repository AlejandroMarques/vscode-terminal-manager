export type TerminalOptions = {
  name?: string | undefined;
  initialPath?: string | undefined;
  shellPath?: string | undefined;
  commands?: string[] | undefined;
};

export type TerminalExtensionConfiguration = {
  terminals: TerminalOptions[];
  focusOnTerminal: string;
  runAutomatically: boolean;
};
