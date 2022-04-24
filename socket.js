const SocketHandler = require('./src/sockets/handlers')

function Socket(io) {
    // constructor
    this.io = io; //cache io
    io.on("connection", (socket) => {
        Object.keys(SocketHandler).forEach(e => {
            registerEventHandler(SocketHandler[e](socket), socket)

        })
        socket.on("disconnect", async () => {
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