import {Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { useEffect, useRef } from "react"
import { AttachAddon } from "@xterm/addon-attach"  
import { useTerminalSocketStore } from "../../../store/terminalSocketStore"


export const BrowserTerminal= ()=>{
    const TerminalRef=useRef(null)
    const {terminalSocket}=useTerminalSocketStore();
    useEffect(() => {
  if (!TerminalRef.current || !terminalSocket) return;

  const term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: "Fira Code, monospace",
    convertEol: true,
    letterSpacing: 0,
    fontWeight: 400,
    theme: {
      background: "#282a37",
      foreground: "#f8f8f2",
    },
  });

  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(TerminalRef.current);
  fitAddon.fit();

  if(terminalSocket) {
            terminalSocket.onopen = () => {
                const attachAddon = new AttachAddon(terminalSocket);
                term.loadAddon(attachAddon);
                // socket.current = ws;
            }
        }


  return () => {
    term.dispose();
  };
}, [terminalSocket]);

     return (
        <div
            ref={TerminalRef}
            style={{
                width: "100vw",
            }}
            className='terminal'
            id="terminal-container"
        >

        </div>
    )
}