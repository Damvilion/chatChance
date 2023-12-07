import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new PusherServer({
    appId: process.env.Pusher_app_id!,
    key: process.env.Pusher_key!,
    secret: process.env.Pusher_secret!,
    cluster: process.env.Pusher_cluster!,
    useTLS: true,
});

export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_Pusher_key!, {
    cluster: 'us2',
});
