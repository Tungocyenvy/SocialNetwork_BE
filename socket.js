const SocketHandler = require('./src/sockets/handlers')

function Socket(io) {
    // constructor
    this.io = io; //cache io

    // io.use(async (socket, next) => {
    //check authentication here
    //...
    // const [bearer, token] = socket.handshake.headers.authorization.split(" ");

    // // if is authenticatedt
    // // get the username

    // if (!token) return;

    // const signalGetUser = await Authentication.parseToken(token);
    // const userInfo = signalGetUser.data;

    // const existUser = await USER_MODEL.findOne({ username: userInfo.username }).lean();

    // const userSocketIDs = existUser?.socketIDs || [];

    // const updateOnlineUser = await USER_MODEL.findOneAndUpdate(
    // 	{ username: userInfo.username },
    // 	{ $set: { socketIDs: [...userSocketIDs, socket.id] } },
    // 	{ upsert: true }
    // );

    // const ccu = await USER_MODEL.find().lean();

    // console.log(ccu);

    // socket.user = userInfo;
    // return next();
    // if not, return null
    // })
    io.on("connection", (socket) => {
        // console.log(`-(${socket.id})` + " is connected");
        Object.keys(SocketHandler).forEach(e => {
            registerEventHandler(SocketHandler[e](socket), socket)

        })


        socket.on("disconnect", async () => {
            // const userAfterREmoveSocketID = await USER_MODEL.findOneAndUpdate(
            // 	{ username: socket.user.username },
            // 	{ $pull: { socketIDs: socket.id } },
            // 	{ new: true }
            // );

            // if (userAfterREmoveSocketID.socketIDs.length == 0) {
            // 	const removeCCU = await USER_MODEL.deleteOne({ _id: userAfterREmoveSocketID._id });
            // }

            // const ccu = await USER_MODEL.find().lean();
            // console.log("disconnect", ccu);
        });

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
    });
}

function registerEventHandler(handler, socket) {
    console.log("handle", handler)
    Object.keys(handler).forEach((eventName) => {
        socket.on(eventName, handler[eventName]);
    });
}

module.exports = Socket;