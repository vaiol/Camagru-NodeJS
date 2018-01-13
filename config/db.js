const dbName = "camagru-db";
const login = "ast1";
const password = "123456";
module.exports = {
    url : "mongodb://"+login+":"+password+"@ds247357.mlab.com:47357/"+dbName,
    dbName : dbName
};