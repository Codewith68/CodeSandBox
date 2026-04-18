import { create } from "zustand";

/**
 * Terminal Socket Store — supports multiple terminals
 * Each terminal has its own WebSocket connection and PTY session
 */
export const useTerminalSocketStore = create((set, get) => ({
    terminals: [], // { id, socket, label }
    activeTerminalId: null,

    /**
     * Add a new terminal
     */
    addTerminal: (projectId) => {
        const id = `term-${Date.now()}`;
        const terminalCount = get().terminals.length;
        const label = `Terminal ${terminalCount + 1}`;

        try {
            const ws = new WebSocket(
                `ws://localhost:4000/terminal?projectId=${projectId}`
            );

            const terminal = { id, socket: ws, label };

            set((s) => ({
                terminals: [...s.terminals, terminal],
                activeTerminalId: id,
            }));

            // Handle unexpected close
            ws.addEventListener("close", () => {
                // Don't auto-remove — user might want to see the dead terminal
                console.log(`Terminal ${label} disconnected`);
            });

            return id;
        } catch (error) {
            console.error("Failed to create terminal:", error);
            return null;
        }
    },

    /**
     * Remove a terminal and close its WebSocket
     */
    removeTerminal: (id) => {
        const { terminals, activeTerminalId } = get();
        const terminal = terminals.find((t) => t.id === id);

        if (terminal?.socket) {
            try {
                terminal.socket.close();
            } catch {}
        }

        const newTerminals = terminals.filter((t) => t.id !== id);
        const newActiveId =
            activeTerminalId === id
                ? newTerminals[newTerminals.length - 1]?.id || null
                : activeTerminalId;

        set({
            terminals: newTerminals,
            activeTerminalId: newActiveId,
        });
    },

    /**
     * Switch active terminal
     */
    setActiveTerminalId: (id) => set({ activeTerminalId: id }),

    /**
     * Get the active terminal's socket
     */
    getActiveSocket: () => {
        const { terminals, activeTerminalId } = get();
        return terminals.find((t) => t.id === activeTerminalId)?.socket || null;
    },

    /**
     * Clean up all terminals
     */
    closeAll: () => {
        const { terminals } = get();
        terminals.forEach((t) => {
            try {
                t.socket?.close();
            } catch {}
        });
        set({ terminals: [], activeTerminalId: null });
    },

    // Legacy compat — keep for components that use the old API
    terminalSocket: null,
    setTerminalSocket: (socket) => set({ terminalSocket: socket }),
}));