'use strict';
import express      from 'express';
import bodyParser   from 'body-parser';
import redisClient  from "./db/redis";
import session      from 'express-session';
import redisConnect from 'connect-redis';
import { connect as mongoConnect } from './db/mongo';

const RedisStore = redisConnect(session);
const app = express();

app.set('port', 8000);

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5000 }
}));


async function start() {
    const db = await mongoConnect();
    console.log("CamNodeJS mongodb connected");
    app.use(bodyParser.urlencoded({ extended: true }));
    // require('./controllers/index')(app, db);
    app.listen(app.get('port'), () => {
        console.log('CamNodeJS api started at port: ' + app.get('port'));
    });
}

start();














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






