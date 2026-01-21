import fs from 'fs/promises';
import uuid4 from 'uuid4';
import { REACT_PROJECT_COMMAND } from '../config/serverConfig.js';
import { execPromisified } from '../utils/execUtility.js';
import directoryTree from 'directory-tree';
import path from 'path';



export const createProjectService=async ()=>{
    // first create a uniqe id in the project folder and create a folder with that id
 const projectId=uuid4();
 console.log("new project id is :", projectId)

await fs.mkdir(`./projects/${projectId}`);

// create a package.json file in the project folder

// after this call the npm create vite@latest in the newly created project folder

const response = await execPromisified(REACT_PROJECT_COMMAND,{
    cwd:`./projects/${projectId}`
})
return projectId;

}


export const getProjectTreeService=async (projectId)=>{
        const projectPath = path.resolve(`./projects/${projectId}`);
        const tree = directoryTree(projectPath);
        return tree;

}
