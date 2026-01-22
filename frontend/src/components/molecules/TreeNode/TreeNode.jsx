import { useState } from "react"
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import { Fileicon } from "../../atoms/fileIcon/fileIcon.jsx";

export const TreeNode =({
    fileFolderData
})=>{

    const [visibility,setVisibility]=useState({})



    function computeExtension(fileFolderData){
        const names=fileFolderData.name.split(".");
        return names[names.length-1];
    }

    function toggleVisibility(name){
        setVisibility({
            ...visibility,
            [name]:!visibility[name]
        })
    }
    return (
        ( fileFolderData &&<div
            style={{
                paddingLeft: "15px",
                color:"white"
            }}
        >
            {fileFolderData.children  /* if the current node is a folder */?(

                /** if the current node is a folder then treat it as a button */
                <button
                
                onClick={()=>toggleVisibility(fileFolderData.name)}
                style={{
                    cursor:"pointer",
                    border:"none",
                    outline:"none",
                    color:"white",
                    backgroundColor:"transparent",
                    paddingTop:"15px",
                    fontSize:"16px"
                }}
                
                >
                    {visibility[fileFolderData.name]?<IoIosArrowDown/>:<IoIosArrowForward/>}
                    {fileFolderData.name}
                </button>
            ):(
                /** if the current node is a file then treat it as a file */
                <div

                style={{
                    display:"flex",
                    alignItems:"center",

                }}>
                    <Fileicon extension={computeExtension(fileFolderData)} />
               
                <p
                style={{
                    paddingTop:"5px",
                    fontSize:"15px",
                    cursor:"pointer",
                    marginLeft:"5px",
                }}
                >
                    {fileFolderData.name}
                </p>
                </div>
                )}

            {visibility[fileFolderData.name] && fileFolderData.children && (
                fileFolderData.children.map((child)=>(
                    <TreeNode
                     key={child.name} 
                    fileFolderData={child}
                    />
                ))
            )}
            
        </div>
        )
    )
}