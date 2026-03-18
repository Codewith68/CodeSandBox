import { useState } from "react";
import { FileIcon } from "../../atoms/fileIcon/FileIcon";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import "./TreeNode.css";

export const TreeNode = ({ fileFolderData, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { editorSocket } = useEditorSocketStore();
    const { activeFileTab } = useActiveFileTabStore();
    const {
        setFile,
        setIsOpen: setFileContextMenuIsOpen,
        setX: setFileContextMenuX,
        setY: setFileContextMenuY,
        setFolder,
    } = useFileContextMenuStore();

    if (!fileFolderData) return null;

    const isFolder = !!fileFolderData.children;
    const fileName = fileFolderData.name;
    const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
    const isActive = activeFileTab?.path === fileFolderData.path;

    function handleFileClick() {
        editorSocket?.emit("readFile", {
            pathToFileOrFolder: fileFolderData.path,
        });
    }

    function handleContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        setFile(fileFolderData.path);
        setFileContextMenuX(e.clientX);
        setFileContextMenuY(e.clientY);
        setFolder(isFolder);
        setFileContextMenuIsOpen(true);
    }

    if (isFolder) {
        return (
            <div className="tree-node">
                <button
                    className="tree-node-folder"
                    style={{ "--depth": depth }}
                    onClick={() => setIsOpen(!isOpen)}
                    onContextMenu={handleContextMenu}
                >
                    <span className={`folder-arrow ${isOpen ? "open" : ""}`}>▶</span>
                    <span className="folder-name">{fileName}</span>
                </button>
                {isOpen && fileFolderData.children && (
                    <div className="tree-children">
                        {fileFolderData.children.map((child) => (
                            <TreeNode
                                key={child.name}
                                fileFolderData={child}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={`tree-node-file ${isActive ? "active" : ""}`}
            style={{ "--depth": depth }}
            onDoubleClick={handleFileClick}
            onContextMenu={handleContextMenu}
        >
            <span className="file-icon-wrapper">
                <FileIcon extension={extension} />
            </span>
            <span className="file-name">{fileName}</span>
        </div>
    );
};