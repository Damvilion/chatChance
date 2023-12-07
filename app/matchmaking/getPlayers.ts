import { pusherServer } from '@/app/lib/pusher';

const attributes = 'subscription_count,user_count';
// All Online users will subscribe to this channel
const channels = ['online_users'];

export const getPlayer = async () => {
    const res = await pusherServer.trigger(channels, 'get-total-users', { message: 'Hello World' }, { info: attributes });

    if (res.status === 200) {
        const body = await res.json();
        const channelsInfo = body.channels;

        return { body, channelsInfo };
    }
};
