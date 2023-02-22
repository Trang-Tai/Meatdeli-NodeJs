const express = require('express');
const app = express();
import * as dotenv from 'dotenv';
dotenv.config();

// serving static file
import path from 'path';
app.use('/static', express.static(path.join(__dirname, 'public'))) // http://localhost:8080/static/6.png

// calling body-parser to handle the Request Object from POST requests
import bodyParser from 'body-parser';
// parse application/json, basically parse incoming Request Object as a JSON Object 
app.use(bodyParser.json({ limit: '50mb' }));
// you can parse incoming Request Object if object, with nested objects, or generally any type.
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser('shs'));

// connectDB
import connectDB from './config/connectDB';
connectDB();

// connect redis
// const client = require('./config/connectRedis');

// cors
import cors from 'cors';
app.use(cors({
    origin: process.env.URL_REACT,
    methods: ['POST', 'GET', 'PUT', 'OPTIONS', 'PATCH', 'DELETE'],
    allowedHeaders: ['origin' ,'X-Requested-With', 'Content-Type', 'token'],
    credentials: true,
}));

// Routing
import routes from './routes';
routes(app);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})