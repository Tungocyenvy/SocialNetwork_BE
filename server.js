require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const route = require('./src/routers');

const cors = require('cors');

const db = require('./src/config/database');
db.connectDb();

const app = express();

//Implement cors
app.use(cors());
//Access-Controll-Allow-Origin
app.options('*', cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, }));

app.use(morgan("dev"))


route(app);

//route(app);
//app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
const port = process.env.PORT;
app.listen(port, () => console.log(`http://localhost:${port}`))