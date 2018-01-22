import redis        from "redis";

const client = redis.createClient();

client.on("error", (err) => {
    console.log(err);
});

export default client;