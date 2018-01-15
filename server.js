'use strict';
const express       = require('express');
const MongoClient   = require('mongodb');
const bodyParser    = require('body-parser');
const configDB      = require('./config/db');
const redis         = require("redis");
const session       = require('express-session');
const RedisStore    = require('connect-redis')(session);

const app = express();
app.set('port', 8000);

/* Redis clint */
const client = redis.createClient();

client.on("error", function (err) {
    console.log("Redis connect error: " + err);
});

app.use(session({
    store: new RedisStore({ client: client }),
    secret: 'secret',
    cookie: { maxAge: 5000 }
}));

app.get('/', function(req, res) {
    if (req.session.views) {
        req.session.views++;
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>views: ' + req.session.views + '</p>');
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
        res.end()
    } else {
        req.session.views = 1;
        res.end('welcome to the session demo. refresh!')
    }
});

/* MongoDB and server start */


MongoClient.connect(configDB.url).then(function (client) {
    const db = client.db(configDB.dbName);
    console.log("CamNodeJS mongodb connected");
    // configurationDB(db);
    app.use(bodyParser.urlencoded({ extended: true }));
    require('./app/routes')(app, db);
    app.listen(app.get('port'), () => {
        console.log('CamNodeJS api started at port: ' + app.get('port'));
    });
}, function(err) {
    console.log("db connection error: " + err);
});







function configurationDB(db) {
    db.collection('users').dropIndexes();
    db.collection('users').createIndex({ "login": 1 }, { unique: true });
    db.collection('users').createIndex({ "email": 1 }, { unique: true });
    db.collection('users').createIndex({ "code": 1 }, { unique: true });
    db.listCollections({name: 'users'}).toArray(function(err, items) {
        db.indexInformation(items[0].name).then(info => {
            console.log(info);
        })
    });
}






