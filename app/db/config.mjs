const db        = "mongodb";
const url       = "ds247357.mlab.com";
const port      = "47357";
const dbName    = "camagru-db";
//credentials
const login     = "ast1";
const password  = "123456";

const link =  `${db}://${login}:${password}@${url}:${port}/${dbName}`;
export default {link, dbName};