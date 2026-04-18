import { useEffect } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { useActiveFileTabStore } from "../store/activeFileTabStore";
import { useEditorSocketStore } from "../store/editorSocketStore";

/**
 * Global keyboard shortcuts for the IDE
 * Register once on ProjectPlayground mount
 */
export const useKeyboardShortcuts = () => {
    const openFileSearch = useSettingsStore((s) => s.openFileSearch);
    const toggleSettingsPanel = useSettingsStore((s) => s.toggleSettingsPanel);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMac = navigator.platform.toUpperCase().includes("MAC");
            const mod = isMac ? e.metaKey : e.ctrlKey;

            // ── Ctrl+S — Save current file ────────────────
            if (mod && e.key === "s") {
                e.preventDefault();
                const { activeFileTab } = useActiveFileTabStore.getState();
                const { editorSocket } = useEditorSocketStore.getState();

                if (activeFileTab?.path && editorSocket) {
                    editorSocket.emit("writeFile", {
                        data: activeFileTab.value,
                        pathToFileOrFolder: activeFileTab.path,
                    });

                    // Mark tab as saved
                    useActiveFileTabStore.getState().markSaved?.(activeFileTab.path);
                }
            }

            // ── Ctrl+P — Open file search ─────────────────
            if (mod && e.key === "p") {
                e.preventDefault();
                openFileSearch();
            }

            // ── Ctrl+, — Open settings ────────────────────
            if (mod && e.key === ",") {
                e.preventDefault();
                toggleSettingsPanel();
            }

            // ── Ctrl+W — Close active tab ─────────────────
            if (mod && e.key === "w") {
                e.preventDefault();
                const { activeFileTab, closeTab } = useActiveFileTabStore.getState();
                if (activeFileTab?.path) {
                    closeTab(activeFileTab.path);
                }
            }

            // ── Ctrl+Tab / Ctrl+Shift+Tab — Switch tabs ──
            if (mod && e.key === "Tab") {
                e.preventDefault();
                const { openTabs, activeFileTab, setActiveFileTab } =
                    useActiveFileTabStore.getState();

                if (openTabs.length <= 1) return;

                const currentIndex = openTabs.findIndex(
                    (t) => t.path === activeFileTab?.path
                );

                let nextIndex;
                if (e.shiftKey) {
                    nextIndex = currentIndex <= 0 ? openTabs.length - 1 : currentIndex - 1;
                } else {
                    nextIndex = currentIndex >= openTabs.length - 1 ? 0 : currentIndex + 1;
                }

                const nextTab = openTabs[nextIndex];
                if (nextTab) {
                    setActiveFileTab(nextTab.path, nextTab.value, nextTab.extension);
                }
            }

            // ── Escape — Close modals ─────────────────────
            if (e.key === "Escape") {
                const { fileSearchOpen, closeFileSearch, settingsPanelOpen } =
                    useSettingsStore.getState();

                if (fileSearchOpen) {
                    closeFileSearch();
                } else if (settingsPanelOpen) {
                    useSettingsStore.getState().toggleSettingsPanel();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [openFileSearch, toggleSettingsPanel]);
};
