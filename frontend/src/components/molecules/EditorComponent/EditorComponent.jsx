import Editor from "@monaco-editor/react";
import { useEffect, useState, } from "react";


export const EditorComponent = () => {


const [editorState, setEditorState]=useState({
    theme:null
});




function handelEditorTheme(editor, monaco) {
    if (!editorState.theme) return;
    monaco.editor.defineTheme('dark', editorState.theme);
    monaco.editor.setTheme('dark');
}


useEffect(()=>{
    async function downloadTheme(){
    const  response =await fetch ('/dark.json')
    const data =await response.json();
    setEditorState({
        ...editorState,
        theme:data
    })
}
    downloadTheme();
},[])
return (
    <>
    {    editorState.theme &&
        <Editor
    height ={'100vh'}
    width={'100%'}
    defaultLanguage="javascript"
    defaultValue="//Welcome To The Playground"
    options={{
        fontSize: 18,
        fontFamily: "Monospace",
    }}

    onMount={handelEditorTheme}
    />}
    </>
)    
}
