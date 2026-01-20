import util from 'util';
import child_process from 'child_process';
import fs from 'fs/promises';
import uuid4 from 'uuid4';


const execPromisified = util.promisify(child_process.exec);


export const createProjectController=async (req,res)=>{
 // first create a uniqe id in the project folder and create a folder with that id
 const projectId=uuid4();
 console.log("new project id is :",projectId)

await fs.mkdir(`./projects/${projectId}`);

// create a package.json file in the project folder

// after this call the npm create vite@latest in the newly created project folder

const response = await execPromisified('npm init vite@latest sandbox -- --template react',{
    cwd:`./projects/${projectId}`
})



return res.json({
    message:"Project created successfully",
    data:response
})

}