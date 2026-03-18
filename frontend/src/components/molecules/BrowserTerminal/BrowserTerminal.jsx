import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { useTerminalSocketStore } from "../../../store/terminalSocketStore";
import "./BrowserTerminal.css";

export const BrowserTerminal = () => {
    const terminalRef = useRef(null);
    const termRef = useRef(null);
    const fitAddonRef = useRef(null);
    const { terminalSocket } = useTerminalSocketStore();

    useEffect(() => {
        if (!terminalRef.current || !terminalSocket) return;

        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: "bar",
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            convertEol: true,
            lineHeight: 1.4,
            theme: {
                background: "#1a1b26",
                foreground: "#c0caf5",
                cursor: "#c0caf5",
                cursorAccent: "#1a1b26",
                selectionBackground: "rgba(99, 102, 241, 0.3)",
                black: "#15161e",
                red: "#f7768e",
                green: "#9ece6a",
                yellow: "#e0af68",
                blue: "#7aa2f7",
                magenta: "#bb9af7",
                cyan: "#7dcfff",
                white: "#a9b1d6",
                brightBlack: "#414868",
                brightRed: "#f7768e",
                brightGreen: "#9ece6a",
                brightYellow: "#e0af68",
                brightBlue: "#7aa2f7",
                brightMagenta: "#bb9af7",
                brightCyan: "#7dcfff",
                brightWhite: "#c0caf5",
            },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);

        // Delay fit to ensure DOM has rendered
        setTimeout(() => fitAddon.fit(), 50);

        termRef.current = term;
        fitAddonRef.current = fitAddon;

        // Send input to backend
        term.onData((data) => {
            if (terminalSocket.readyState === WebSocket.OPEN) {
                terminalSocket.send(data);
            }
        });

        // Receive output from backend
        const handleMessage = async (event) => {
            let data = event.data;
            if (data instanceof Blob) {
                data = await data.text();
            }
            term.write(data);
        };

        terminalSocket.addEventListener("message", handleMessage);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            try { fitAddon.fit(); } catch { /* ignore */ }
        });
        resizeObserver.observe(terminalRef.current);

        return () => {
            terminalSocket.removeEventListener("message", handleMessage);
            resizeObserver.disconnect();
            term.dispose();
        };
    }, [terminalSocket]);

    return (
        <div className="terminal-wrapper">
            <div className="terminal-header">
                <div className="terminal-header-left">
                    <div className="terminal-tab">
                        <span className="terminal-tab-icon">⬛</span>
                        Terminal
                    </div>
                </div>
                <div className="terminal-header-actions">
                    <button className="terminal-action-btn" title="Clear">⌫</button>
                </div>
            </div>
            <div className="terminal-body">
                {terminalSocket ? (
                    <div ref={terminalRef} style={{ width: "100%", height: "100%" }} />
                ) : (
                    <div className="terminal-connecting">
                        <span className="terminal-connecting-spinner" />
                        Connecting to terminal...
                    </div>
                )}
            </div>
        </div>
    );
};
