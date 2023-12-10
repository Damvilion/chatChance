import { createClient } from 'redis';

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
    },
});

client.on('error', (err) => {
    console.log('Redis error: ', err);
});

if (!client.isOpen) {
    client.connect();
}

export { client as redisClient };
