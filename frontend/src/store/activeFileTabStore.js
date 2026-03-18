import { create } from "zustand";

export const useActiveFileTabStore = create((set, get) => ({
    activeFileTab: null,
    openTabs: [],

    setActiveFileTab: (path, value, extension) => {
        const currentTabs = get().openTabs;
        const existingTab = currentTabs.find((t) => t.path === path);

        if (existingTab) {
            // Update the existing tab's value and set as active
            set({
                activeFileTab: { path, value, extension },
                openTabs: currentTabs.map((t) =>
                    t.path === path ? { ...t, value, extension } : t
                ),
            });
        } else {
            // Add new tab and set as active
            set({
                activeFileTab: { path, value, extension },
                openTabs: [...currentTabs, { path, value, extension }],
            });
        }
    },

    closeTab: (path) => {
        const { openTabs, activeFileTab } = get();
        const newTabs = openTabs.filter((t) => t.path !== path);

        if (activeFileTab?.path === path) {
            // Activate the previous or next tab
            const closedIndex = openTabs.findIndex((t) => t.path === path);
            const newActive = newTabs[Math.min(closedIndex, newTabs.length - 1)] || null;
            set({
                openTabs: newTabs,
                activeFileTab: newActive,
            });
        } else {
            set({ openTabs: newTabs });
        }
    },
}));