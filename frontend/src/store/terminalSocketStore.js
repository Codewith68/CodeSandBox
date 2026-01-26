import { create } from "zustand"

export const useTerminalSocketStore = create((set) => ({
  terminalSocket: null,
  setTerminalSocket: (incomingSocket) =>
    set(() => ({
      terminalSocket: incomingSocket,
    })),
}))