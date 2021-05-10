import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';
import * as Polls from './controllers/poll_controller';

// initialize
const app = express();

// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/cs52poll';

mongoose.connect(mongoURI).then(() => {
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
app.get('/', (req, res) => {
  Polls.getPolls().then((polls) => {
    res.render('index', { polls });
  }).catch((error) => {
    res.send(`error: ${error}`);
  });
});

app.get('/new', (req, res) => {
  res.render('new');
});

app.post('/new', (req, res) => {
  const newpoll = {
    text: req.body.text,
    imageURL: req.body.imageURL,
  };
  Polls.createPoll(newpoll).then((poll) => {
    res.redirect('/');
  });
});

app.post('/vote/:id', (req, res) => {
  const vote = (req.body.vote === 'up');// convert to bool
  Polls.vote(req.params.id, vote).then((result) => {
    console.log(req.params.id);
    res.send(result);
  });
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
