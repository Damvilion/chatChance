import { pusherServer } from '@/app/lib/pusher';
import { NextResponse } from 'next/server';

type data = {
    socket_id: string;
    randomUser: string;
    room: string;
};
// API Route to get the number of online users
export async function POST(request: Request) {
    const data: data = await request.json();
    const { socket_id: user1, randomUser: user2, room } = data;

    const channels = ['matchmaking'];

    const res = await pusherServer.trigger(channels, 'match_found', { user1, user2, room });

    if (res.status === 200) {
        return NextResponse.json({
            message: 'Success',
            status: 200,
        });
    } else {
        return NextResponse.json({ message: 'Failed', status: 400 });
    }
}
