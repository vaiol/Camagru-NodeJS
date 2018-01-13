'use strict';
const express       = require('express');
const MongoClient   = require('mongodb');
const bodyParser    = require('body-parser');
const configDB            = require('./config/db');
const assert        = require('assert');
const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
MongoClient.connect(configDB.url, (err, client) => {
    assert.equal(null, err);

    const db = client.db(configDB.dbName);


    // configurationDB(db);


    require('./app/routes')(app, db);
    app.listen(port, () => {
        console.log('CamNodeJS started at port: ' + port);
    });
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






