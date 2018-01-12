module.exports = function(app, db) {
    app.post('/user', (req, res) => {
        const user = { login: req.body.login, email: req.body.email, pass1: req.body.pass1, pass2: req.body.pass2 };
        if (!user.login || user.login.length < 4) {
            return res.send({ 'code': '2', 'message': 'minimum login length is 4 symbols' });
        } else if (!user.login || user.login.length > 100) {
            return res.send({ 'code': '3', 'message': 'maximum login length is 100 symbols' });
        } else if (!user.email || user.email.length > 100) {
            return res.send({ 'code': '4', 'message': 'minimum email length is 100 symbols' });
        }
        db.collection('users').insert(user, (err, result) => {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            } else {
                res.send(result.ops[0]);
            }
        });


    });
};