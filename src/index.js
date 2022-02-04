const path=require('path')
const http=require('http')
const express  =require('express')
const socketio=require('socket.io')

const app=express()
const server =http.createServer(app)
const io=socketio(server)

const Filter=require('bad-words')

const port =process.env.PORT || 3000
const pubicDirectoryPath=path.join(__dirname ,'../public')

const { generateMessage }=require('./utils/messages')
const { generateLocationMessage }= require('./utils/messages')

//importing the users.js file
const{ addUser,removeUser,getUser,getUsersInRoom} =require('./utils/users')

app.use(express.static(pubicDirectoryPath))


io.on('connection',(socket) =>{//io.on is used for all the messages to print
    console.log('new web socket connection')

    //tjus allows to add the user
    socket.on('join',({username,room},callback)=>{

        const {error,user}=addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','WELCOME!'))
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`)) //this broad cast helps to show new client joined in te chat
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()

    })

    // socket.emit('count updated')

    
    socket.on('sendMessage',(message,callback)=>{

        const filter=new Filter()

        if(filter.isProfane(message)){
            return callback('profanity is not allowed')
        }

        //getting user from the function 
        const user=getUser(socket.id)

        //this allows to send message to a particular room 
        io.to(user.room).emit('message',generateMessage(user.username,message)) //if we use socket.emit it will not reflect in all the clients so using io.emit
        callback()
    })







    socket.on('sendlocation',(coords,callback)=>{


        const user=getUser(socket.id)
        io.to(user.room).emit('Locationmessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback()

    })

    //removes the user form the functiom
    socket.on('disconnect',()=>{
 
       const user=removeUser(socket.id) 

       if(user){
        
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} left the chat`)) // this print s that user has left 
    
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })


       }
})


})

server.listen(port,()=>{
    console.log(`server is up on ${port}`)
})