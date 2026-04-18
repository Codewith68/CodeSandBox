import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { useTerminalSocketStore } from "../../../store/terminalSocketStore";
import "./BrowserTerminal.css";

/**
 * Single terminal instance — renders xterm for one WebSocket connection
 */
const TerminalInstance = ({ terminal, isActive }) => {
    const terminalRef = useRef(null);
    const termRef = useRef(null);
    const fitAddonRef = useRef(null);

    useEffect(() => {
        if (!terminalRef.current || !terminal?.socket) return;

        // If already initialized, just fit
        if (termRef.current) {
            if (isActive) {
                setTimeout(() => {
                    try { fitAddonRef.current?.fit(); } catch {}
                }, 50);
            }
            return;
        }

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

        setTimeout(() => fitAddon.fit(), 50);

        termRef.current = term;
        fitAddonRef.current = fitAddon;

        // Send input to backend
        term.onData((data) => {
            if (terminal.socket.readyState === WebSocket.OPEN) {
                terminal.socket.send(data);
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

        terminal.socket.addEventListener("message", handleMessage);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            try { fitAddon.fit(); } catch {}
        });
        resizeObserver.observe(terminalRef.current);

        return () => {
            terminal.socket.removeEventListener("message", handleMessage);
            resizeObserver.disconnect();
            term.dispose();
            termRef.current = null;
        };
    }, [terminal?.socket]);

    // Re-fit when becoming active
    useEffect(() => {
        if (isActive && fitAddonRef.current) {
            setTimeout(() => {
                try { fitAddonRef.current.fit(); } catch {}
            }, 50);
        }
    }, [isActive]);

    return (
        <div
            className="terminal-instance"
            style={{ display: isActive ? "block" : "none" }}
        >
            <div ref={terminalRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
};

/**
 * Multi-terminal component with tab bar
 */
export const BrowserTerminal = ({ projectId }) => {
    const {
        terminals,
        activeTerminalId,
        setActiveTerminalId,
        addTerminal,
        removeTerminal,
    } = useTerminalSocketStore();

    // Create first terminal if none exist
    useEffect(() => {
        if (terminals.length === 0 && projectId) {
            addTerminal(projectId);
        }
    }, [projectId]);

    const handleNewTerminal = () => {
        if (projectId) {
            addTerminal(projectId);
        }
    };

    const handleCloseTerminal = (e, id) => {
        e.stopPropagation();
        removeTerminal(id);
    };

    return (
        <div className="terminal-wrapper">
            {/* Terminal Tab Bar */}
            <div className="terminal-header">
                <div className="terminal-header-left">
                    {terminals.map((term) => (
                        <button
                            key={term.id}
                            className={`terminal-tab ${
                                activeTerminalId === term.id ? "active" : ""
                            }`}
                            onClick={() => setActiveTerminalId(term.id)}
                        >
                            <span className="terminal-tab-icon">⬛</span>
                            <span className="terminal-tab-label">{term.label}</span>
                            {terminals.length > 1 && (
                                <span
                                    className="terminal-tab-close"
                                    onClick={(e) => handleCloseTerminal(e, term.id)}
                                >
                                    ✕
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="terminal-header-actions">
                    <button
                        className="terminal-action-btn"
                        title="New Terminal"
                        onClick={handleNewTerminal}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Terminal Instances */}
            <div className="terminal-body">
                {terminals.length === 0 ? (
                    <div className="terminal-connecting">
                        <span className="terminal-connecting-spinner" />
                        Connecting to terminal...
                    </div>
                ) : (
                    terminals.map((term) => (
                        <TerminalInstance
                            key={term.id}
                            terminal={term}
                            isActive={activeTerminalId === term.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
