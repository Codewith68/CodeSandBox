import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { useSettingsStore } from "../../../store/settingsStore";
import { extensionToFileType } from "../../../utils/extensionToFileType";

export const EditorComponent = () => {
    const timerRef = useRef(null);
    const monacoRef = useRef(null);
    const [themeLoaded, setThemeLoaded] = useState(false);

    const { activeFileTab } = useActiveFileTabStore();
    const { editorSocket } = useEditorSocketStore();

    // Read settings reactively
    const fontSize = useSettingsStore((s) => s.fontSize);
    const fontFamily = useSettingsStore((s) => s.fontFamily);
    const wordWrap = useSettingsStore((s) => s.wordWrap);
    const minimap = useSettingsStore((s) => s.minimap);
    const fontLigatures = useSettingsStore((s) => s.fontLigatures);
    const lineNumbers = useSettingsStore((s) => s.lineNumbers);
    const tabSize = useSettingsStore((s) => s.tabSize);
    const themeName = useSettingsStore((s) => s.theme);
    const themeFile = useSettingsStore((s) => s.themeFile);
    const autoSave = useSettingsStore((s) => s.autoSave);
    const autoSaveDelay = useSettingsStore((s) => s.autoSaveDelay);

    // Load and apply theme
    useEffect(() => {
        fetch(themeFile)
            .then((res) => res.json())
            .then((data) => {
                if (monacoRef.current) {
                    monacoRef.current.editor.defineTheme(themeName, data);
                    monacoRef.current.editor.setTheme(themeName);
                }
                setThemeLoaded(true);
            })
            .catch((err) => {
                console.error("Failed to load editor theme:", err);
                setThemeLoaded(true); // Don't block editor on theme error
            });
    }, [themeName, themeFile]);

    function handleEditorMount(editor, monaco) {
        monacoRef.current = monaco;

        // Load the theme
        fetch(themeFile)
            .then((res) => res.json())
            .then((data) => {
                monaco.editor.defineTheme(themeName, data);
                monaco.editor.setTheme(themeName);
                setThemeLoaded(true);
            })
            .catch(() => setThemeLoaded(true));

        // Enable JSX support for JavaScript and TypeScript
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            allowJs: true,
            esModuleInterop: true,
        });

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            esModuleInterop: true,
        });

        // Suppress some noisy diagnostics for a sandbox environment
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });
    }

    const saveFile = useCallback(
        (value, path) => {
            if (editorSocket && path) {
                editorSocket.emit("writeFile", {
                    data: value,
                    pathToFileOrFolder: path,
                });
                useActiveFileTabStore.getState().markSaved(path);
            }
        },
        [editorSocket]
    );

    function handleChange(value) {
        // Immediately update the tab store so switching tabs preserves edits
        const { activeFileTab: currentTab, openTabs } = useActiveFileTabStore.getState();
        if (currentTab?.path) {
            useActiveFileTabStore.setState({
                activeFileTab: { ...currentTab, value },
                openTabs: openTabs.map((t) =>
                    t.path === currentTab.path ? { ...t, value } : t
                ),
            });

            // Mark as modified
            useActiveFileTabStore.getState().markModified(currentTab.path);
        }

        // Debounce the actual file write to disk (via socket)
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (autoSave) {
            timerRef.current = setTimeout(() => {
                saveFile(value, currentTab?.path);
            }, autoSaveDelay);
        }
        // If auto-save is off, Ctrl+S (from keyboard shortcuts hook) handles saving
    }

    if (!themeLoaded) {
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
                fontSize,
                fontFamily,
                fontLigatures,
                minimap: { enabled: minimap, maxColumn: 80 },
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap,
                lineNumbers,
                tabSize,
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