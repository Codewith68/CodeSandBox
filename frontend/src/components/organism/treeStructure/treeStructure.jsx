import { useTreeStructureStore } from "../../../store/treeStructureStore";
import { useEffect } from "react";
import { TreeNode } from "../../molecules/TreeNode/TreeNode";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { FileContextMenu } from "../../molecules/contextMenu/FileContextMenu.jsx";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import "./treeStructure.css";

export const TreeStructure = () => {
    const { treeStructure, setTreeStructure } = useTreeStructureStore();
    const { editorSocket } = useEditorSocketStore();
    const {
        file,
        isOpen: isFileContextOpen,
        x: fileContextX,
        y: fileContextY,
    } = useFileContextMenuStore();

    useEffect(() => {
        if (!treeStructure) {
            setTreeStructure();
        }
    }, [setTreeStructure, treeStructure]);

    // Listen for tree updates from backend
    useEffect(() => {
        if (editorSocket) {
            const handleTreeUpdate = () => {
                setTreeStructure();
            };
            editorSocket.on("treeStructureUpdate", handleTreeUpdate);
            return () => {
                editorSocket.off("treeStructureUpdate", handleTreeUpdate);
            };
        }
    }, [editorSocket, setTreeStructure]);

    return (
        <div className="tree-explorer">
            <div className="tree-header">
                <span className="tree-header-title">Explorer</span>
                <div className="tree-header-actions">
                    <button
                        className="tree-action-btn"
                        title="Refresh"
                        onClick={() => setTreeStructure()}
                    >
                        ↻
                    </button>
                </div>
            </div>
            <div className="tree-content">
                {isFileContextOpen && fileContextX && fileContextY && (
                    <FileContextMenu x={fileContextX} y={fileContextY} path={file} />
                )}
                <TreeNode fileFolderData={treeStructure} depth={0} />
            </div>
        </div>
    );
};