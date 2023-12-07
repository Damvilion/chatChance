import { pusherServer } from '@/app/lib/pusher';
import { NextResponse } from 'next/server';

// API Route to get the number of online users
export async function GET(request: Request) {
    const attributes = 'subscription_count,user_count';
    // All Online users will subscribe to this channel
    const channels = ['online_users'];

    try {
        const res = await pusherServer.trigger(channels, 'get-total-users', { message: 'Hello World' }, { info: attributes });

        if (res.status === 200) {
            const body = await res.json();
            const channelsInfo = body.channels;
            return NextResponse.json({ body, channelsInfo });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error triggering event' });
    }
}
