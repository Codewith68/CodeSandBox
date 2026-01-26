import express from "express";
import cors from "cors";
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import chokidar from 'chokidar';
import WebSocket, { WebSocketServer } from 'ws';



import apiRouter from "./routes/index.js";
import {PORT} from "./config/serverConfig.js";
import { handleEditorSocketEvents } from "./socketHandlers/editorHandler.js";
import { handleContainerCreate, listContainer } from "./containers/handleContainerCreate.js";
import { handleTerminalCreation } from "./containers/handleTerminalCreation.js";

const app=express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('/api',apiRouter);

app.get('/ping',(req,res)=>{
    return res.json({
        message:"pong"
    })
})






io.on('connection', (socket) => {
  console.log('a user connected');
});

const editorNamespace =io.of('/editor');
editorNamespace.on('connection', (socket) => {
  console.log('a user connected to editor');

  //somehow we will get the projectId from frontend

  let projectId=socket.handshake.query['projectId'];
  console.log("project Id received after connection ",projectId)
   if(projectId){
    var watcher = chokidar.watch(`./projects/${projectId}`,{
      ignored:(path)=>path.includes('node_modules'),
      persistent:true,/** this will keep the process running even if there are no changes in the file system */
      awaitWriteFinish:{
        stabilityThreshold:2000,/** this is ensure stability of files before emitting events */
      },
      ignoreInitial:true,/** this will ignore the initial events */
    });

    
    watcher.on('all', (event, path) => {
      console.log(`event ${event} happened on ${path}`);
  })
  
}
socket.on("joinFileRoom", ({ path }) => {
    socket.join(path);
    console.log(`joined room: ${path}`);
  });

  socket.on("leaveFileRoom", ({ path }) => {
    socket.leave(path);
    console.log(`left room: ${path}`);
  });
  socket.on("joinProjectRoom", ({ projectId }) => {
    socket.join(projectId);
    console.log(`joined room: ${projectId}`);
  });

  socket.on("leaveProjectRoom", ({ projectId }) => {
    socket.leave(projectId);
    console.log(`left room: ${projectId}`);
  });
   socket.on("getPort",()=>{
    console.log("getting port for terminal");
    listContainer()
  })


handleEditorSocketEvents(socket,editorNamespace);

    socket.on('disconnect', async() => {
      await watcher.close();
    console.log('user disconnected');
  });
});




server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});

const webSocketForTerminal= new WebSocketServer({
  noServer: true,// we will handle the upgrade event manually 
})

server.on("upgrade",(req,tcpSocket,head)=>{
  /** 
   * req:incomming http request
   * socket: socket object of the connection
   * head : the first packet of the http request
   */
  // this callback will be called the client tris to connect with the sever through websocket 

  const isTerminal=req.url.includes('/terminal');
  if(isTerminal){

    console.log("request for terminal received",req.url)
    const projectId=req.url.split('=')[1];
    console.log("project id received for terminal",projectId)
    handleContainerCreate(projectId,webSocketForTerminal,req,tcpSocket,head);  
  }
    
})
webSocketForTerminal.on('connection',(ws,req,container)=>{
  console.log('a user connected to terminal',ws,req,container); 
  handleTerminalCreation(container,ws);    
  ws.on("close",()=>{
    container.remove({force:true},(err,data)=>{
      if(err){
        console.log("error while removing container",err);
        return;
      }
      console.log("container removed successfully",data); 
    })
  })
})  