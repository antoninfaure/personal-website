const bodyParser = require("body-parser");
const chokidar = require('chokidar');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const express = require("express");
const helmet = require('helmet');
const nunjucks = require('nunjucks');
const sanitizer = require('sanitize')();
const path = require('path')

const IN_PROD = process.env.NODE_ENV === 'production';

const app = express()

//--------------------//
//* SETUP AND CONFIG *//
//--------------------//
// Set Robots.txt Response //
app.use('/robots.txt', function (req, res, next) {
  res.type('text/plain')
  res.send("User-agent: *\nDisallow: /");
});

// RENDER ENGINE config //
nunjucks.configure('static', {autoescape: true, express: app, watch: true});

app.use(require('sanitize').middleware);
//app.use(helmet());
app.set('trust proxy', 1);
app.disable('X-Powered-By');
app.disable('x-powered-by');
app.use(helmet.noSniff())

// SET header for all request //
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// PARSE REQUEST //
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(csurf({cookie: true}));


const TIME_OUT_REQUEST_TIME = 60000; //ms

app.use('*', (req,res,next)=> {
  res.setTimeout(TIME_OUT_REQUEST_TIME, () => {
    console.log('request timed out');
    res.status(408).redirect('/');
  });
  next();
});

//* END SETUP and CONFIG *//

// HTTPS Redirect //
if (IN_PROD) {
  app.use(function(req, res, next) {
    if (('https' != req.get('X-Forwarded-Proto'))) {
      res.redirect('https://' + req.get('Host') + req.url);
    } else next();
  });
}

//---------------------//
//*    MAIN ROUTES    *//
//---------------------//

/// HOME
app.get('/', (req,res) => {
  res.render('templates/index.html');
})
.get('/projects/resteajour', (req,res) => {
  res.render('templates/resteajour.html');
})
.get('/projects/kitcoach', (req,res) => {
  res.render('templates/kitcoach.html');
})
.get('/projects/amacepfl', (req,res) => {
  res.render('templates/amacepfl.html');
})
.get('/projects/christmascards', (req,res) => {
  res.render('templates/christmascards.html');
})
.get('/projects/isacademia', (req,res) => {
  res.render('templates/isacademia.html');
})

//Static Folder
app.use(express.static(path.join(__dirname, 'static'), {etag: false}));

// error handler
app.use(function (err, req, res, next) {
  if (err.code == 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    console.log(req)
    res.status(403).send('Invalid csrf token');
  } else if (err.code == 'ETIMEDOUT') {
    res.status(408).end();
  } else return next(err)

})

//Redirect to home if don't exist
app.get('/*', (req, res) => {
  if('HEAD' == req.method) res.status(404).end();
  else res.redirect('/');
})


module.exports = app;
