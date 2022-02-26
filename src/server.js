import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';

// at top of server.js
import apiRouter from './router';

// initialize
const app = express();

// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/snsc';

mongoose.connect(mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false,
}).then(() => {
  console.log('connected to database:', mongoURI);
}).catch((err) => {
  console.log('error: could not connect to db:', err);
});

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable only if you want templating
app.set('view engine', 'ejs');

// enable only if you want static assets from folder static
app.use(express.static('static'));

// this just allows us to render ejs from the ../app/views directory
app.set('views', path.join(__dirname, '../src/views'));

// enable json message body for posting data to API
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads

// additional init stuff should go before hitting the routing

// default index route
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
// this should go AFTER body parser
app.use('/api', apiRouter);

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
