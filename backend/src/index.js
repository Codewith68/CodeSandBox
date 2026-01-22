import express from "express";
import cors from "cors";
import { Server } from 'socket.io';
import { createServer } from 'node:http';


import apiRouter from "./routes/index.js";
import {PORT} from "./config/serverConfig.js";

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
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});