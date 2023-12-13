import { createClient } from 'redis';

// const client = createClient({
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT!,
//     },
// });

const client = createClient({
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD as string,
    socket: {
        host: process.env.NEXT_PUBLIC_REDIS_HOST as string,
        port: process.env.NEXT_PUBLIC_REDIS_PORT as unknown as number,
    },
});

client.on('error', (err) => {
    console.log('Redis error: ', err);
});

if (!client.isOpen) {
    client.connect();
}

export { client as redisClient };
