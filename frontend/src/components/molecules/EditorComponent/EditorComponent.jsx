import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useEditorSocketStore } from "../../../store/editorSocketStore.js";
import { useActiveFileTabStore } from "../../../store/activeFileTabStore.js";

export const EditorComponent = () => {

  const [editorState, setEditorState] = useState({
    theme: null
  });
 const {  activeFileTab, setActiveFileTab } = useActiveFileTabStore();
  const { editorSocket } = useEditorSocketStore();

  function handelEditorTheme(editor, monaco) {
    if (!editorState.theme) return;
    monaco.editor.defineTheme("dark", editorState.theme);
    monaco.editor.setTheme("dark");
  }

  useEffect(() => {
    if (!editorSocket) return;

    editorSocket.on("readFileSuccess", (data) => {
      console.log("received file content from server", data);
      setActiveFileTab(data.path, data.value,);
    });

    return () => {
      editorSocket.off("readFileSuccess");
    };
  }, [editorSocket]);

  useEffect(() => {
    async function downloadTheme() {
      const response = await fetch("/dark.json");
      const data = await response.json();
      setEditorState(prev => ({ ...prev, theme: data }));
    }
    downloadTheme();
  }, []);

 const editorValue =
  activeFileTab?.value ?? "//Welcome To The Playground";

return (
  <>
    {editorState.theme && (
      <Editor
        height="100vh"
        width="100%"
        defaultLanguage={undefined}
        options={{
          fontSize: 18,
          fontFamily: "Monospace",
        }}
        value={editorValue}
        onMount={handelEditorTheme}
      />
    )}
  </>
);
};
