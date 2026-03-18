import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { extensionToFileType } from "../../../utils/extensionToFileType";

export const EditorComponent = () => {
    const timerRef = useRef(null);
    const [themeData, setThemeData] = useState(null);
    const { activeFileTab } = useActiveFileTabStore();
    const { editorSocket } = useEditorSocketStore();

    useEffect(() => {
        fetch("/dark.json")
            .then((res) => res.json())
            .then((data) => setThemeData(data))
            .catch((err) => console.error("Failed to load editor theme:", err));
    }, []);

    function handleEditorMount(editor, monaco) {
        if (themeData) {
            monaco.editor.defineTheme("codeforge-dark", themeData);
            monaco.editor.setTheme("codeforge-dark");
        }
    }

    function handleChange(value) {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            if (editorSocket && activeFileTab?.path) {
                editorSocket.emit("writeFile", {
                    data: value,
                    pathToFileOrFolder: activeFileTab.path,
                });
            }
        }, 1500);
    }

    if (!themeData) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    background: "#1e1f2e",
                    color: "#64748b",
                    fontSize: "0.85rem",
                }}
            >
                Loading editor...
            </div>
        );
    }

    return (
        <Editor
            width="100%"
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Welcome to CodeForge ⚡\n// Open a file from the explorer to start coding"
            options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: true, maxColumn: 80 },
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
            }}
            language={extensionToFileType(activeFileTab?.extension)}
            onChange={handleChange}
            value={
                activeFileTab?.value ||
                "// Welcome to CodeForge ⚡\n// Open a file from the explorer to start coding"
            }
            onMount={handleEditorMount}
        />
    );
};