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


            container.exec({
                Cmd: ['/bin/bash'],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
            },(err,exec)=>{
                if(err){
                    console.log("error while executing command",err);
                }
                exec.start({
                    hijack: true,
                    stdin: true,
                    stdout: true,
                },(err,stream)=>{
                    if(err){
                        console.log("error while starting exec",err);
                        return;
                    }
                    processStream(stream,socket);
                    socket.on("shell-input",(data)=>{
                        console.log("input received data",data);
                        stream.write('pwd\n');
                    })
                })
            })
    } catch (error) {
        console.log("error while creating container",error);
    }

}
function processStream(stream,socket){

    let buffer= Buffer.from("");
    stream.on("data",(chunk)=>{
        buffer=Buffer.concat([buffer,chunk]);
        socket.emit("shell-output",buffer.toString());
        buffer= Buffer.from("");
})

stream.on("end",()=>{
    console.log("stream ended");
    socket.emit("shell-output","stream ended");
})


stream.on("error",(err)=>{
    console.log("error while processing stream",err);
    socket.emit("shell-output","error while processing stream");    
    socket.emit("shell-output",err.message);    
})


}