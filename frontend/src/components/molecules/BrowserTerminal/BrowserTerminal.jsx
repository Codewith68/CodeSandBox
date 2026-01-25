import {Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { useEffect, useRef } from "react"
import {io} from 'socket.io-client'
import { useParams } from "react-router-dom"


export const BrowserTerminal= ()=>{
    const TerminalRef=useRef(null)
    const socket =useRef(null)
    const {projectId:projectIdFromUrl}=useParams(); 
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
                yellow:"#f1fa8c",
                blue:"#8be9fd",
                magenta:"#ff79c6",
                cyan:"#8be9fd",
                white:"#f8f8f2",
                brightBlack:"#6272a4",
                brightRed:"#ff5555",
                brightGreen:"#50fa7b",
                brightYellow:"#f1fa8c",
                brightBlue:"#8be9fd",
                brightMagenta:"#ff79c6",
                brightCyan:"#8be9fd",
                brightWhite:"#f8f8f2",
            },
            fontSize:16,
            fontFamily:"ubuntu mono",
            letterSpacing:0.5,
            convertEol:true,
        })
        term.open(TerminalRef.current)
        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        fitAddon.fit()
        socket.current=io(`${import.meta.env.VITE_BACKEND_URL}/terminal`,{
            query:{
                projectId:projectIdFromUrl
            },
        })
        socket.current.on("shell-output",(data)=>{
            term.write(data)
        })
        term.onData((data)=>{
            console.log(data)
            socket.current.emit("shell-input",data)
        })
        return ()=>{
            term.dispose()
            socket.current.disconnect()
        }
    },[])
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