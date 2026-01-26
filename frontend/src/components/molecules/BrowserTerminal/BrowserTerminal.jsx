import {Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { useEffect, useRef } from "react"
import { AttachAddon } from "@xterm/addon-attach"  
import { useTerminalSocketStore } from "../../../store/terminalSocketStore"


export const BrowserTerminal= ()=>{
    const TerminalRef=useRef(null)
    const {terminalSocket}=useTerminalSocketStore();
    useEffect(()=>{
        const term =new Terminal({
            cursorBlink:true,
            theme:{
                background:"#282a37",
                foreground:"#f8f8f2",
                cursor:"#f8f8f2",
                black:"#282a37",
                red:"#ff5555",
                green:"#50fa7b",
            },
            fontSize:14,
            fontFamily:"fira code,monospace",
            convertEol:true,
            letterSpacing:0,
            lineHeight:1.3,

        })
        term.open(TerminalRef.current)
        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        fitAddon.fit()
        // socket.current=io(`${import.meta.env.VITE_BACKEND_URL}/terminal`,{
        //     query:{
        //         projectId:projectIdFromUrl
        //     },
        // })

        if(terminalSocket){
            const attachAddon = new AttachAddon(terminalSocket)
            term.loadAddon(attachAddon)
        }
        return ()=>{
            term.dispose()
        }
    },[terminalSocket])
    return (
        <div
        ref={TerminalRef}
        style={{
                height:"25vh",
                overflow:"auto",

        }}
        className="terminal"
        id="terminal-container"
        
        >


        </div>
    )
}