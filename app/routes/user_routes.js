const minPassLen = 6;
const maxPassLen = 256;
const minLoginLen = 4;
const maxLoginLen = 30;
const minEmailLen = 3;
const maxEmailLen = 256;

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}

function randomString(len) {
    return Math.random().toString(36).substring(2, len + 3);
}

function hash(pass) {
    return pass;
}


module.exports = function(app, db) {
    const collection = db.collection('users');
    app.post('/user', (req, res) => {
        //user registration
        const login = req.body.login;
        const email = req.body.email;
        const pass1 = req.body.pass1;
        const pass2 = req.body.pass2;

        if (!login || login.length < minLoginLen) {
            return res.send({ 'code': 2, 'message': 'minimum login length is '+minLoginLen+' symbols' });
        } else if (login.length > maxLoginLen) {
            return res.send({ 'code': 3, 'message': 'maximum login length is '+maxLoginLen+' symbols' });
        } else if (!email || email.length < minEmailLen) {
            return res.send({ 'code': 4, 'message': 'minimum email length is '+minEmailLen+' symbols' });
        } else if (email.length > maxEmailLen) {
            return res.send({ 'code': 5, 'message': 'maximum email length is '+maxEmailLen+' symbols' });
        } else if (!validateEmail(email)) {
            return res.send({ 'code': 6, 'message': 'email is not valid' });
        } else if (!pass1 || !pass2 || pass1 !== pass2) {
            return res.send({ 'code': 7, 'message': 'passwords did not match' });
        } else if (pass1.length < minPassLen) {
            return res.send({ 'code': 8, 'message': 'minimum password length is '+minPassLen+' symbols' });
        } else if (pass1.length > maxPassLen) {
            return res.send({ 'code': 9, 'message': 'maximum password length is '+maxPassLen+' symbols' });
        }



        const user = { login: login, email: email, password: hash(pass1), notification: true, activated: false, code: randomString(12) };
        collection.insertOne(user).then(function (result) {
            // sendMail();
            res.send(result.ops[0]);
            res.send({ code: 1, message: "user '"+login+"' successfully created, check email '"+email+"'" });
        }, function(err) {
            if (err.code == 11000) {
                let field = err.message.split(".$")[1];
                field = field.split(" dup key")[0];
                field = field.substring(0, field.lastIndexOf("_"));
                if (field === "login") {
                    return res.send({ 'code': 10, 'message': 'login "'+login+'" exist' });
                } else if (field === "email") {
                    return res.send({ 'code': 11, 'message': 'email "'+email+'"exist' });
                }
            }
            res.send({ 'code': err.code, 'message': err.errmsg });
        });

    });
    app.put('/user', (req, res) => {
        //user email confirmation
        const code = req.body.code;
        if (!code) {
            return res.send({ code: 2, message: "code is invalid" });
        }
        collection.updateOne({ code: code }, { $set: { code: null, activated: true }}).then(function(info) {
            if (info.result.nModified) {
                res.send({ code: 1, message: "user activated successful" });
            } else {
                res.send({ code: 3, message: "user with same code ("+code+") not found" });
            }
        }, function(err) {
            res.send({ 'code': err.code, 'message': err.errmsg });
        });
    });
    app.post('/user/pass', (req, res) => {
        //initiate user password restore process
        const user = req.body.user;
        if (!user) {
            return res.send({ code: 2, message: "user field is empty" });
        }
        collection.updateOne({$or: [ { email: user }, { login: user} ] }, { $set: { code: randomString(12) }}).then(function(info) {
            if (info.result.nModified) {
                // sendMail();
                res.send({ code: 1, message: "email with instructions has been send to user: "+user });
            } else {
                res.send({ code: 3, message: "user '"+user+"' not found" });
            }
        }, function(err) {
            res.send({ 'code': err.code, 'message': err.errmsg });
        });
    });
    app.put('/user/pass', (req, res) => {
        //finish user password restore process
        const user = req.body.user;
        const code = req.body.code;
        const pass1 = req.body.pass1;
        const pass2 = req.body.pass2;

        if (!user || !code || !pass1 || !pass2) {
            return res.send({ code: 2, message: "some field is empty" });
        } else if (pass1 !== pass2) {
            return res.send({ 'code': 7, 'message': 'passwords did not match' });
        } else if (pass1.length < minPassLen) {
            return res.send({ 'code': 8, 'message': 'minimum password length is '+minPassLen+' symbols' });
        } else if (pass1.length > maxPassLen) {
            return res.send({ 'code': 9, 'message': 'maximum password length is '+maxPassLen+' symbols' });
        }

        collection.updateOne({$and: [{code: code}, {$or: [ { email: user }, { login: user} ] }]}, { $set: { code: null, password: hash(pass1) }}).then(function(info) {
            if (info.result.nModified) {
                res.send({ code: 1, message: "password changed successful for user '"+user+"'" });
            } else {
                res.send({ code: 3, message: "chain user '"+user+"' and code '"+code+"' not found" });
            }
        }, function(err) {
            res.send({ 'code': err.code, 'message': err.errmsg });
        });
    });
};
