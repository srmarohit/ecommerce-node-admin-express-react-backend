require("dotenv").config();
const express = require("express");
const app = express();

const authRoute = require("./router/v1/auth");
const userRoute = require("./router/v1/user");
const productRoute = require("./router/v1/product");
const cartRoute = require("./router/v1/cart");
const orderRoute = require("./router/v1/order");

const conversation = require("./router/v1/conversations");
const messages = require("./router/v1/messages");

const io = require("socket.io")(process.env.WEBSOCKETPORT, {
    cors: {
      origin: "*",
    },
});


const videoIo = require("socket.io")(process.env.MEDIAPORT, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});  


app.use(require("cors")());
app.use(express.json())

require("./db/mongo/connection_1");

app.use('/api/v1/auth', authRoute );
app.use('/api/v1/user', userRoute );
app.use('/api/v1/product', productRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/order', orderRoute);

// chat route
app.use('/api/v1/messanger/conversation', conversation);
app.use('/api/v1/messanger/message',messages );


// socket methods and code

let users = [];

const addUser = (userId, socketId) => {
    // insert if user not exist
    !users.some( user => user.userId === userId) &&
    users.push({userId, socketId});
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = userId => {
    return users.find(user => user.userId === userId);
}

io.on("connection", socket => {
    // when user connected
   // console.log("A new User connected..");

    //take userId and socketId from user
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        //console.log("user added "+userId)
        console.log("---------add users-----")
        console.log(users)
        io.emit("getUsers", users);
    });

    // send and getMessage
    socket.on("sendMessage", ({senderId, receiverId, text}) => {
        const user = getUser(receiverId);
        console.log("message sent by "+senderId)
        console.log(user)
        user && io.to(user.socketId).emit("getMessage", {
            senderId,
            text
        });
    })

    // when user disconnected
    socket.on('disconnect', ()=>{
        if(users.find(user => user.socketId == socket.id) ){
            console.log("A User hasbeen disconnected..");
            removeUser(socket.id);
            console.log("---------disconnect then users-----")
            console.log(users)
            io.emit("getUsers", users);
        }
        console.log("still executing")
    });

    
    socket.on("connect_error", (err) => { 
         console.log(`connect_error due to ${err.message}`);
    });

});


videoIo.on("connection", (socket) => {
    console.log("video chatter connected.."+ socket.id)
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
        console.log("A chatter disconnected..")
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        console.log(`call user pinged from ${from} | ${name} | ${userToCall} | ${signalData}`)
		videoIo.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
        console.log(`Answer call ${data.to}`)
		videoIo.to(data.to).emit("callAccepted", data.signal)
	});
});

app.listen(process.env.PORT || 5000, ()=> console.log("App is running on port "+process.env.PORT+ " ")) 