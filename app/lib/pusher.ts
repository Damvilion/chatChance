import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

const pusherServer = new PusherServer({
    appId: process.env.Pusher_app_id!,
    key: process.env.Pusher_key!,
    secret: process.env.Pusher_secret!,
    cluster: process.env.Pusher_cluster!,
    useTLS: true,
});

export { pusherServer };
