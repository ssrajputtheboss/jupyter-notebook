const {spawn} = require('child_process')
const {Server} = require('socket.io')
const { createServer } = require('http')
const express = require('express')
const app = express()
app.use(express.static(__dirname+'/public'))
app.get('/',(rq,rs)=>{
    rs.sendFile(__dirname+'/public/index.html')
})
const server = createServer(app)
const jwt = require('jsonwebtoken')
require('dotenv').config()
const SECRET = process.env.SECRET
jwt.sign({api:'wallah-habibi'},SECRET||'secret',(err,token)=>console.log(token))
const io = new Server(server ,{ cors : { origin: "*" } })

const python = spawn('python',['-i'])

let lastIndex = 0
//python.stdin.write('print("test")\n')

python.on('close',()=>io.sockets.disconnectSockets() && server.close())

python.on('error',e=>console.log(e))

python.stdout.on("data",(chunk)=>{
    io.sockets.emit("out",{output:chunk.toString(),index:lastIndex})
})

python.stderr.on('data',(chunk)=>{
    const o = chunk.toString().replace(/>>>/ig,'')
    io.sockets.emit('out',{output:o,index:lastIndex})
})

io.use((socket,next)=>{
    const token = socket.handshake.headers['authentication'] || ''
    jwt.verify(token,SECRET||'secret',(err,data)=>{
        if(data.api === 'wallah-habibi'){
            next()
        }
    })
})

io.on("connection",(socket)=>{

    if(python.killed){python = spawn('python',['-i'])}

    socket.on("in",(data)=>{
        const {input,index} = data
        lastIndex=index
        python.stdin.write(input+"\n")
    })

    socket.on( "disconnect",()=>console.log('disconnected') )

})

server.listen(process.env.PORT || 7000)