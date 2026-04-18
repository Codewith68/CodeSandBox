import { useState, useMemo } from "react";
import { FileIcon, FolderIcon } from "../../atoms/fileIcon/FileIcon";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import "./TreeNode.css";

/**
 * Sort children: folders first (alphabetically), then files (alphabetically)
 */
function sortChildren(children) {
    if (!children) return [];
    return [...children].sort((a, b) => {
        const aIsFolder = !!a.children;
        const bIsFolder = !!b.children;
        if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}

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

    // Sort children once when data changes
    const sortedChildren = useMemo(
        () => sortChildren(fileFolderData?.children),
        [fileFolderData?.children]
    );

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
                    <span className="folder-icon-wrapper">
                        <FolderIcon isOpen={isOpen} />
                    </span>
                    <span className="folder-name">{fileName}</span>
                </button>
                {isOpen && sortedChildren.length > 0 && (
                    <div className="tree-children">
                        {sortedChildren.map((child) => (
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
            onClick={handleFileClick}
            onContextMenu={handleContextMenu}
        >
            <span className="file-icon-wrapper">
                <FileIcon extension={extension} filename={fileName} />
            </span>
            <span className="file-name">{fileName}</span>
        </div>
    );
};