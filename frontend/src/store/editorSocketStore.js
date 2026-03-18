import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";
import { usePortStore } from "./portStore";

export const useEditorSocketStore = create((set) => ({
    editorSocket: null,
    setEditorSocket: (incomingSocket) => {
        const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;
        const projectTreeStructureSetter = useTreeStructureStore.getState().setTreeStructure;
        const portSetter = usePortStore.getState().setPort;

        // File read success → open file in editor + tab bar
        incomingSocket?.on("readFileSuccess", (data) => {
            const fileExtension = data.path.split(".").pop();
            activeFileTabSetter(data.path, data.value, fileExtension);
        });

        // File write success
        incomingSocket?.on("writeFileSuccess", (data) => {
            console.log("File saved:", data.path);
        });

        // File/folder deletion → refresh tree
        incomingSocket?.on("deleteFileSuccess", () => {
            projectTreeStructureSetter();
        });

        incomingSocket?.on("deleteFolderSuccess", () => {
            projectTreeStructureSetter();
        });

        // Rename success → refresh tree
        incomingSocket?.on("renameFileOrFolderSuccess", () => {
            projectTreeStructureSetter();
        });

        // Tree structure update from backend
        incomingSocket?.on("treeStructureUpdate", () => {
            projectTreeStructureSetter();
        });

        // Get container port
        incomingSocket?.on("getPortSuccess", ({ port }) => {
            if (port) {
                portSetter(port);
            }
        });

        set({ editorSocket: incomingSocket });
    },
}));