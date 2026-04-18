import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Settings Store — persisted to localStorage
 * Controls editor behavior, theme, and auto-save preferences
 */
export const useSettingsStore = create(
    persist(
        (set, get) => ({
            // ── Editor Settings ──────────────────────────
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            wordWrap: "on",
            minimap: true,
            fontLigatures: true,
            lineNumbers: "on",
            tabSize: 2,

            // ── Theme ────────────────────────────────────
            theme: "codeforge-dark", // theme key
            themeFile: "/themes/dark.json", // path to JSON

            // ── Auto-Save ────────────────────────────────
            autoSave: true,
            autoSaveDelay: 1000, // ms

            // ── UI State ─────────────────────────────────
            settingsPanelOpen: false,
            fileSearchOpen: false,

            // ── Actions ──────────────────────────────────
            updateSetting: (key, value) => set({ [key]: value }),

            setTheme: (themeKey, themeFilePath) =>
                set({ theme: themeKey, themeFile: themeFilePath }),

            toggleSettingsPanel: () =>
                set((s) => ({ settingsPanelOpen: !s.settingsPanelOpen })),

            openFileSearch: () => set({ fileSearchOpen: true }),
            closeFileSearch: () => set({ fileSearchOpen: false }),

            resetSettings: () =>
                set({
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    wordWrap: "on",
                    minimap: true,
                    fontLigatures: true,
                    lineNumbers: "on",
                    tabSize: 2,
                    theme: "codeforge-dark",
                    themeFile: "/themes/dark.json",
                    autoSave: true,
                    autoSaveDelay: 1000,
                }),
        }),
        {
            name: "codeforge-settings", // localStorage key
            partialize: (state) => ({
                // Only persist actual settings, not UI state
                fontSize: state.fontSize,
                fontFamily: state.fontFamily,
                wordWrap: state.wordWrap,
                minimap: state.minimap,
                fontLigatures: state.fontLigatures,
                lineNumbers: state.lineNumbers,
                tabSize: state.tabSize,
                theme: state.theme,
                themeFile: state.themeFile,
                autoSave: state.autoSave,
                autoSaveDelay: state.autoSaveDelay,
            }),
        }
    )
);

/**
 * Available themes — used by theme picker UI
 */
export const AVAILABLE_THEMES = [
    {
        key: "codeforge-dark",
        label: "CodeForge Dark",
        file: "/themes/dark.json",
        preview: { bg: "#1e1f2e", accent: "#6366f1", text: "#c0caf5" },
    },
    {
        key: "monokai",
        label: "Monokai Pro",
        file: "/themes/monokai.json",
        preview: { bg: "#2d2a2e", accent: "#ff6188", text: "#fcfcfa" },
    },
    {
        key: "dracula",
        label: "Dracula",
        file: "/themes/dracula.json",
        preview: { bg: "#282a36", accent: "#bd93f9", text: "#f8f8f2" },
    },
    {
        key: "github-dark",
        label: "GitHub Dark",
        file: "/themes/github-dark.json",
        preview: { bg: "#0d1117", accent: "#58a6ff", text: "#c9d1d9" },
    },
    {
        key: "one-dark-pro",
        label: "One Dark Pro",
        file: "/themes/one-dark-pro.json",
        preview: { bg: "#282c34", accent: "#61afef", text: "#abb2bf" },
    },
];
