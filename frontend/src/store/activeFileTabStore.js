import { create } from "zustand";

export const useActiveFileTabStore = create((set, get) => ({
    activeFileTab: null,
    openTabs: [],

    /**
     * Open or switch to a file tab
     * Tracks both current value and saved value for dirty detection
     */
    setActiveFileTab: (path, value, extension) => {
        const currentTabs = get().openTabs;
        const existingTab = currentTabs.find((t) => t.path === path);

        if (existingTab) {
            // Update the existing tab's value and set as active
            set({
                activeFileTab: { ...existingTab, value, extension },
                openTabs: currentTabs.map((t) =>
                    t.path === path ? { ...t, value, extension } : t
                ),
            });
        } else {
            // Add new tab — savedValue = value (freshly loaded from disk)
            const newTab = { path, value, extension, savedValue: value, isModified: false };
            set({
                activeFileTab: newTab,
                openTabs: [...currentTabs, newTab],
            });
        }
    },

    /**
     * Mark a tab as modified (unsaved changes)
     */
    markModified: (path) => {
        const { openTabs, activeFileTab } = get();
        set({
            openTabs: openTabs.map((t) =>
                t.path === path ? { ...t, isModified: true } : t
            ),
            activeFileTab:
                activeFileTab?.path === path
                    ? { ...activeFileTab, isModified: true }
                    : activeFileTab,
        });
    },

    /**
     * Mark a tab as saved — sync savedValue to current value
     */
    markSaved: (path) => {
        const { openTabs, activeFileTab } = get();
        set({
            openTabs: openTabs.map((t) =>
                t.path === path
                    ? { ...t, isModified: false, savedValue: t.value }
                    : t
            ),
            activeFileTab:
                activeFileTab?.path === path
                    ? { ...activeFileTab, isModified: false, savedValue: activeFileTab.value }
                    : activeFileTab,
        });
    },

    /**
     * Close a tab with neighbor activation logic
     */
    closeTab: (path) => {
        const { openTabs, activeFileTab } = get();
        const newTabs = openTabs.filter((t) => t.path !== path);

        if (activeFileTab?.path === path) {
            // Activate the previous or next tab
            const closedIndex = openTabs.findIndex((t) => t.path === path);
            const newActive =
                newTabs[Math.min(closedIndex, newTabs.length - 1)] || null;
            set({
                openTabs: newTabs,
                activeFileTab: newActive,
            });
        } else {
            set({ openTabs: newTabs });
        }
    },
}));