require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const route = require('./src/routers');
const cron = require('./src/services/schedule.service');

const cors = require('cors');
const app = express();
const Socket = require('./socket')
//socket
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

const db = require('./src/config/database');
db.connectDb();

  
//Implement cors
app.use(cors());
//Access-Controll-Allow-Origin
app.options('*', cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
}));

app.use(morgan("dev"))


route(app);
Socket(io)
const port = process.env.PORT;
server.listen(port, () => console.log(`http://localhost:${port}`));
