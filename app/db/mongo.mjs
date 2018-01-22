import config from "./config"
import  * as MongoClient  from "mongodb"

let db = null;

export async function connect() {
    try {
        const client = await MongoClient.connect(config.url);
        db = client.db(config.dbName);
    } catch (err) {
        console.log();
    }
    return db;
}

export default db;