import { useParams } from "react-router-dom";
import { EditorComponent } from "../components/molecules/EditorComponent/EditorComponent";
import { EditorButton } from "../components/atoms/EditorButton/EditorButton";
import { TreeStructure } from "../components/organism/treeStructure/treeStructure";
import {  useEffect, useRef } from "react";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorSocketStore } from "../store/editorSocketStore";
import {io} from 'socket.io-client'
import { BrowserTerminal } from "../components/molecules/BrowserTerminal/BrowserTerminal";
import { useTerminalSocketStore } from "../store/terminalSocketStore";


export const ProjectPlayground = () => {

const{projectId:projectIdFromUrl}=useParams();
const {setProjectId,projectId} = useTreeStructureStore();
const {setEditorSocket ,editorSocket} =useEditorSocketStore();
const {setTerminalSocket}=useTerminalSocketStore();
const socket=useRef(null);


function fetchPort(){
    console.log(editorSocket)
    editorSocket.emit("getPort");
    console.log("feching port");
}



useEffect(()=>{
    if(projectIdFromUrl){
    setProjectId(projectIdFromUrl);
    const editorSocketconn=io(`${import.meta.env.VITE_BACKEND_URL}/editor`,{
        query:{
            projectId:projectIdFromUrl
        }
    })
    socket.current=new WebSocket("ws://localhost:3000/terminal?projectId="+projectIdFromUrl)
    setTerminalSocket(socket.current);
     setEditorSocket(editorSocketconn);
}

},[setProjectId,projectIdFromUrl,setEditorSocket,setTerminalSocket])
    
    return (
        <>
       <div
       style={{
        display:"flex"
       }}>

        {projectId &&(
        <div
        style={{
            backgroundColor:"#333254",
            paddingRight:"10px",
            paddingTop: "0.3vh",
            minWidth:"250px",
            maxWidth:"25%",
            height:"99.7vh",
            overflow:"auto",

        }}
        >
        <TreeStructure/>
        </div>
        )}
        <EditorComponent/>
       </div>
        <EditorButton isActive={false}/>
        <EditorButton isActive={true}/>
        <div>
            <button
                onClick={fetchPort}
            >
                getPort 
            </button>
        </div>
        <div>
            <BrowserTerminal/>
        </div>
        
        </>
    )
}