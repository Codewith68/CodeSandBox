import "./FileContextMenu.css";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { useState } from "react";

export const FileContextMenu = ({ x, y, path }) => {
    const { setIsOpen, isFolder } = useFileContextMenuStore();
    const { editorSocket } = useEditorSocketStore();
    const [newName, setNewName] = useState("");
    const [showRename, setShowRename] = useState(false);

    const [showNew, setShowNew] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    function handleDelete(e) {
        e.preventDefault();
        if (isFolder) {
            editorSocket?.emit("deleteFolder", { pathToFileOrFolder: path });
        } else {
            editorSocket?.emit("deleteFile", { pathToFileOrFolder: path });
        }
        setIsOpen(false);
    }

    function handleRename(e) {
        e.preventDefault();
        if (!newName || !path) return;

        const sep = path.includes("\\") ? "\\" : "/";
        const parentDir = path.substring(0, path.lastIndexOf(sep));

        let newPath;
        if (isFolder) {
            newPath = `${parentDir}${sep}${newName}`;
        } else {
            const oldName = path.split(sep).pop();
            const ext = oldName.includes(".") ? "." + oldName.split(".").pop() : "";
            const cleanName = newName.replace(/\.[^/.]+$/, "");
            newPath = `${parentDir}${sep}${cleanName}${ext}`;
        }

        editorSocket?.emit("renameFileOrFolder", { oldPath: path, newPath });
        setNewName("");
        setShowRename(false);
        setIsOpen(false);
    }

    function handleCreateNew(e) {
        e.preventDefault();
        if (!newName || !path) return;

        const sep = path.includes("\\") ? "\\" : "/";
        const targetDir = isFolder ? path : path.substring(0, path.lastIndexOf(sep));
        const newPath = `${targetDir}${sep}${newName}`;

        if (isCreatingFolder) {
            editorSocket?.emit("createFolder", { pathToFileOrFolder: newPath });
        } else {
            editorSocket?.emit("createFile", { pathToFileOrFolder: newPath });
        }

        setNewName("");
        setShowNew(false);
        setIsOpen(false);
    }

    return (
        <div
            onMouseLeave={() => setIsOpen(false)}
            className="context-menu"
            style={{ left: x, top: y, position: "fixed" }}
        >
            <button className="context-menu-item" onClick={() => { setShowNew(true); setIsCreatingFolder(false); setShowRename(false); }}>
                <span className="context-menu-icon">📄</span>
                New File
            </button>
            <button className="context-menu-item" onClick={() => { setShowNew(true); setIsCreatingFolder(true); setShowRename(false); }}>
                <span className="context-menu-icon">📁</span>
                New Folder
            </button>
            <button className="context-menu-item" onClick={() => { setShowRename(true); setShowNew(false); }}>
                <span className="context-menu-icon">✏️</span>
                Rename
            </button>
            <button className="context-menu-item danger" onClick={handleDelete}>
                <span className="context-menu-icon">🗑️</span>
                Delete
            </button>

            {showRename && (
                <div className="context-menu-rename">
                    <input
                        className="context-menu-input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(e)}
                        placeholder="New name"
                        autoFocus
                    />
                    <button className="context-menu-rename-btn" onClick={handleRename}>✓</button>
                </div>
            )}

            {showNew && (
                <div className="context-menu-rename">
                    <input
                        className="context-menu-input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateNew(e)}
                        placeholder={isCreatingFolder ? "Folder name" : "File name"}
                        autoFocus
                    />
                    <button className="context-menu-rename-btn" onClick={handleCreateNew}>✓</button>
                </div>
            )}
        </div>
    );
};