import { useParams } from "react-router-dom";
import { EditorComponent } from "../components/molecules/EditorComponent/EditorComponent";
import { TreeStructure } from "../components/organism/treeStructure/treeStructure";
import { useEffect, useState } from "react";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorSocketStore } from "../store/editorSocketStore";
import { useActiveFileTabStore } from "../store/activeFileTabStore";
import { useSettingsStore } from "../store/settingsStore";
import { io } from "socket.io-client";
import { BrowserTerminal } from "../components/molecules/BrowserTerminal/BrowserTerminal";
import { useTerminalSocketStore } from "../store/terminalSocketStore";
import { Browser } from "../components/organism/Browser/Browser";
import { FileTabBar } from "../components/molecules/FileTabBar/FileTabBar";
import { Breadcrumbs } from "../components/molecules/Breadcrumbs/Breadcrumbs";
import { FileSearchModal } from "../components/molecules/FileSearchModal/FileSearchModal";
import { SettingsPanel } from "../components/molecules/SettingsPanel/SettingsPanel";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { extensionToFileType } from "../utils/extensionToFileType";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./ProjectPlayground.css";

export const ProjectPlayground = () => {
    const { projectId: projectIdFromUrl } = useParams();
    const { setProjectId, projectId } = useTreeStructureStore();
    const { setEditorSocket } = useEditorSocketStore();
    const { terminals } = useTerminalSocketStore();
    const [isConnected, setIsConnected] = useState(false);

    // Active file tab for status bar info
    const activeFileTab = useActiveFileTabStore((s) => s.activeFileTab);
    const autoSave = useSettingsStore((s) => s.autoSave);
    const toggleSettingsPanel = useSettingsStore((s) => s.toggleSettingsPanel);

    // Register global keyboard shortcuts
    useKeyboardShortcuts();

    useEffect(() => {
        if (projectIdFromUrl) {
            setProjectId(projectIdFromUrl);

            // Socket.IO for editor operations
            const editorSocketConn = io(
                `${import.meta.env.VITE_BACKEND_URL}/editor`,
                { query: { projectId: projectIdFromUrl } }
            );

            editorSocketConn.on("connect", () => setIsConnected(true));
            editorSocketConn.on("disconnect", () => setIsConnected(false));

            setEditorSocket(editorSocketConn);

            return () => {
                editorSocketConn.disconnect();
                // Clean up all terminals on unmount
                useTerminalSocketStore.getState().closeAll();
            };
        }
    }, [setProjectId, projectIdFromUrl, setEditorSocket]);

    // Loading state
    if (!projectId) {
        return (
            <div className="playground-loading">
                <div className="loading-spinner" />
                <div className="loading-text">Setting up your environment...</div>
            </div>
        );
    }

    // Truncate project ID for display
    const shortId = projectIdFromUrl?.substring(0, 8) || "project";

    // Current file language for status bar
    const currentLanguage = activeFileTab?.extension
        ? extensionToFileType(activeFileTab.extension) || activeFileTab.extension
        : null;

    return (
        <div className="playground-container">
            {/* Top Navigation Bar */}
            <div className="playground-topbar">
                <div className="topbar-brand">
                    <div className="topbar-logo">⚡</div>
                    <div className="topbar-title">
                        Code<span>Forge</span>
                    </div>
                </div>
                <div className="topbar-project-name">
                    📁 {shortId}...
                </div>
                <div className="topbar-actions">
                    <button
                        className="topbar-action-btn"
                        title="Settings (Ctrl+,)"
                        onClick={toggleSettingsPanel}
                    >
                        ⚙️
                    </button>
                    <div className="topbar-status">
                        <span className={`status-dot ${isConnected ? "" : "disconnected"}`} />
                        {isConnected ? "Connected" : "Disconnected"}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="playground-main">
                {/* Sidebar - File Explorer */}
                <div className="playground-sidebar">
                    <TreeStructure />
                </div>

                {/* Editor + Terminal + Browser */}
                <Allotment>
                    {/* Left: Editor + Terminal */}
                    <Allotment.Pane minSize={300}>
                        <div className="playground-editor-area" style={{ height: "100%" }}>
                            <FileTabBar />
                            <Breadcrumbs />
                            <div style={{ flex: 1, minHeight: 0, height: "100%" }}>
                                <Allotment vertical>
                                    <Allotment.Pane minSize={100}>
                                        <EditorComponent />
                                    </Allotment.Pane>
                                    <Allotment.Pane minSize={80} preferredSize={200}>
                                        <BrowserTerminal projectId={projectIdFromUrl} />
                                    </Allotment.Pane>
                                </Allotment>
                            </div>
                        </div>
                    </Allotment.Pane>

                    {/* Right: Browser Preview */}
                    <Allotment.Pane minSize={250}>
                        <div className="playground-preview-area" style={{ height: "100%" }}>
                            {terminals.length > 0 && (
                                <Browser projectId={projectIdFromUrl} />
                            )}
                        </div>
                    </Allotment.Pane>
                </Allotment>
            </div>

            {/* Status Bar */}
            <div className="playground-statusbar">
                <div className="statusbar-left">
                    <span className="statusbar-item">⚡ CodeForge</span>
                    <span className="statusbar-item">
                        {isConnected ? "🟢 Live" : "🔴 Offline"}
                    </span>
                </div>
                <div className="statusbar-right">
                    {activeFileTab?.isModified && (
                        <span className="statusbar-item statusbar-unsaved">● Modified</span>
                    )}
                    {autoSave && (
                        <span className="statusbar-item statusbar-autosave">⟳ Auto-save</span>
                    )}
                    {currentLanguage && (
                        <span className="statusbar-item">{currentLanguage}</span>
                    )}
                    <span className="statusbar-item">🐳 Docker</span>
                    <span className="statusbar-item">UTF-8</span>
                </div>
            </div>

            {/* ── Overlay Modals ─────────────────────────── */}
            <FileSearchModal />
            <SettingsPanel />
        </div>
    );
};