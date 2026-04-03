import Docker from 'dockerode';
// import path from 'path';
const docker = new Docker();

export const listContainer = async () => {

    const containers = await docker.listContainers();
    console.log("Containers", containers);
    // PRINT PORTS ARRAY FROM ALL CONTAINER
    containers.forEach((containerInfo) => {
        console.log(containerInfo.Ports);
    })
}

export const handleContainerCreate = async (projectId, terminalSocket, req, tcpSocket, head) => {
    console.log("Project id received for container create", projectId);
    try {

        // Delete any existing container running with same name
        const existingContainer = await docker.listContainers({
            name: projectId
        });


        console.log("Existing container", existingContainer);

        if(existingContainer.length > 0) {
            console.log("Container already exists, stopping and removing it");
            const container = docker.getContainer(existingContainer[0].Id);
            await container.remove({force: true});
        }

        console.log("Creating a new container");

        const container = await docker.createContainer({
            Image: 'sandbox', // name given by us for the written dockerfile
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Cmd: ['/bin/bash'],
            name: projectId,
            Tty: true,
            User: "sandbox",
            Volumes: {
                "/home/sandbox/app": {}
            },
            ExposedPorts: {
                    "5173/tcp": {}
            },
            Env: ["HOST=0.0.0.0"],
            HostConfig: {
                Binds: [ // mounting the project directory to the container
                    `${process.cwd()}/projects/${projectId}:/home/sandbox/app`
                ],
                PortBindings: {
                    "5173/tcp": [
                        {
                            "HostPort": "0" // random port will be assigned by docker
                        }
                    ]
                },
                
            }
        });
    
        console.log("Container created", container.id);

        await container.start();

        console.log("container started");

        // Auto-start Vite dev server inside the container
        try {
            const exec = await container.exec({
                Cmd: ['/bin/bash', '-c', 'cd /home/sandbox/app/sandbox && npm run dev'],
                AttachStdout: true,
                AttachStderr: true,
                Tty: false,
                User: 'sandbox',
            });
            exec.start({ hijack: true }, (err, stream) => {
                if (err) {
                    console.error("Failed to auto-start Vite:", err.message);
                    return;
                }
                console.log("Vite dev server auto-started in container");
                stream.on('data', (chunk) => {
                    console.log("[vite]", chunk.toString().trim());
                });
            });
        } catch (err) {
            console.error("Failed to exec Vite in container:", err.message);
        }

        return container;



    } catch(error) {
        console.log("Error while creating container", error);
    }


}


export async function getContainerPort(containerName) {
    try {
        const containers = await docker.listContainers({
            filters: { name: [containerName] }
        });

        if (containers.length === 0) {
            console.log(`No container found with name: ${containerName}`);
            return undefined;
        }

        const containerInfo = await docker.getContainer(containers[0].Id).inspect();
        const ports = containerInfo?.NetworkSettings?.Ports;

        // Check for Vite's default port 5173
        if (ports?.["5173/tcp"]?.[0]?.HostPort) {
            return ports["5173/tcp"][0].HostPort;
        }

        console.log("Port 5173 not yet bound, container may still be starting...");
        return undefined;
    } catch (error) {
        console.error("Error fetching container port:", error.message);
        return undefined;
    }
}