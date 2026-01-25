import { useTreeStructureStore } from "../../../store/treeStructureStore"
import { useEffect } from "react";
import { TreeNode } from "../../molecules/TreeNode/TreeNode";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { FileContextMenu } from "../../molecules/ContextMenu/FileContextMenu.jsx";

export const TreeStructure = () => {

    const {treeStructure, setTreeStructure } = useTreeStructureStore();
    const { 
        file,
        isOpen: isFileContextOpen, 
        x: fileContextX, 
        y: fileContextY ,
        isFolder: isFileContextFolder,} = useFileContextMenuStore();

    useEffect(() => {
        if(treeStructure) {
            console.log("tree:", treeStructure);
        } else {
            setTreeStructure();
        }
    }, [setTreeStructure, treeStructure]);

    return (
        <>
        {isFileContextOpen && fileContextX!= null&& fileContextY!= null&& (
            <FileContextMenu  
                x={fileContextX}
                y={fileContextY}
                path={file}
                isFolder={isFileContextFolder}
            />
        )}
            <TreeNode
                fileFolderData={treeStructure}
                
            />
        </>
    )
}