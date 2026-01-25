import './FileContextMenu.css';

import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { useEditorSocketStore } from '../../../store/editorSocketStore';
import { useState } from 'react';

export const FileContextMenu = ({
    x,
    y,
    path
}) => {
    const { setIsOpen } = useFileContextMenuStore();
    const { isFolder } = useFileContextMenuStore();


    const { editorSocket } = useEditorSocketStore();
    const [newName, setNewName] = useState("");




   function handelFileRename(e) {
  e.preventDefault();

  if (!editorSocket || !path || !newName) return;

  const sep = path.includes("\\") ? "\\" : "/";
  const parentDir = path.substring(0, path.lastIndexOf(sep));

  let newPath;

  if (isFolder) {
    newPath = `${parentDir}${sep}${newName}`;
  } else {
    const oldName = path.split(sep).pop();

    const extension = oldName.includes(".")
      ? "." + oldName.split(".").pop()
      : "";

    // remove extension if user typed it
    const cleanNewName = newName.replace(/\.[^/.]+$/, "");

    newPath = `${parentDir}${sep}${cleanNewName}${extension}`;
  }

  editorSocket.emit("renameFileOrFolder", {
    oldPath: path,
    newPath
  });

  setNewName("");
  setIsOpen(false);
}


    function handleFileDelete(e) {
        e.preventDefault();
        console.log("Deleting file at", path);
        editorSocket.emit("deleteFile", {
            pathToFileOrFolder: path
        });
    }

    return (
        <div
            onMouseLeave={() => {
                console.log("Mouse left");
                setIsOpen(false);
            }}
            className='fileContextOptionsWrapper'
            style={{
                left: x,
                top: y,
                position: "fixed"
            }}
        >
            <button
                className='fileContextButton'
                onClick={handleFileDelete}
            >
                Delete File
            </button>
            <button
                className='fileContextButton'
                onClick={handelFileRename}
            >
                Rename File
            </button>
            <input
            value={newName}
            placeholder='New Name'
            onChange={(e) => setNewName(e.target.value)}
            
/>


        </div>
    )
}