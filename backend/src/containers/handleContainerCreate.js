import Docker from "dockerode";

const docker = new Docker();

export const listContainer=async()=>{
    const containers=await docker.listContainers();
    console.log("containers",containers);

    // print port arrat from all container
    containers.forEach((containerInfo)=>{
        const port=containerInfo.Ports;  
        console.log("port",port);
    })
}

export const handleContainerCreate =async(projectId,terminalSocket,req,tcpSocket,head)=>{
    console.log("project ID received for the container create ",projectId);
    try {
        const container = await docker.createContainer({
        Image:'sandbox',  // name given by us for the written dockerfile
        AttachStdin:true,
        AttachStderr:true,
        AttachStdout:true,
        Tty:true,
        Cmd:['/bin/bash'],
        User:'sandbox',
        ExposedPorts:{
                "5173/tcp":{}
            },
            Env:["HOST=0.0.0.0"],
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
        } 
});
            console.log("container created successfully",container.id);
            await container.start();
            console.log("container started successfully");

            //this is the placw where we upgrade the http request to websocket connection
            terminalSocket.handleUpgrade(req,tcpSocket,head,(establishedWSconn)=>{
                terminalSocket.emit("connection",establishedWSconn,req,container);
            });

    } catch (error) {
        console.log("error while creating container",error);
    }

}
