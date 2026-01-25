import Docker from "dockerode";

const docker = new Docker();


export const handleContainerCreate =async(projectId,socket)=>{
    console.log("project ID received for the container create ",projectId);
    try {
        const container = await docker.createContainer({
        Image:'sandbox',  // name given by us for the written dockerfile
        AttachStdin:true,
        AttachStderr:true,
        AttachStdout:true,
        Tty:true,
        CMD:['/bin/bash'],
        USer:'sandbox',
        HostConfig:{
            Binds:[ // binding the project directory to the container
                `${process.cwd()}/projects/${projectId}:/home/sandbox/app`
            ],
            PortBindings:{
                "5173/tcp":[
                    {
                        HostPort:'0' // this will bind the port to any available port on the host machine
                    }
                ]
            },
            exposedPorts:{
                "5173/tcp":{}
            },
            Env:["HOST=0.0.0.0"]
        }
})
            console.log("container created successfully",container.id);
            await container.start();
            console.log("container started successfully");
    } catch (error) {
        console.log("error while creating container",error);
    }

}