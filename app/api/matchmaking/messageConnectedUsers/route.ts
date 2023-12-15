import { pusherServer } from '@/app/lib/pusher';
import { NextResponse } from 'next/server';

// API Route to get the number of online users
export async function POST(request: Request) {
    const data = await request.json();
    const { socket_id: user1, randomUser: user2 } = data;

    const channels = ['online_users'];

    const res = await pusherServer.trigger(channels, 'match_found', { user1, user2 });

    if (res.status === 200) {
        const body = await res.json();
        const channelsInfo = body.channels;

        return NextResponse.json({
            body,
            channelsInfo,
        });
    } else {
        return NextResponse.json({ message: 'Failed', status: 400 });
    }
}
