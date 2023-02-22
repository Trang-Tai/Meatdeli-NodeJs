const redis = require("redis");
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
});

client.on("connect", function () {
    console.log('connected');
})

client.on("ready", function () {
    console.log('Redis to ready');
})

client.ping((err, pong) => console.log(pong));

client.on("error", function (error) {
    console.error(error);
});

module.exports = client;