import { NextResponse } from 'next/server';
import { redisClient } from '@/app/lib/redis';
import { pusherServer } from '@/app/lib/pusher';

export async function POST(request: Request) {
    // Delete all previous online users
    await redisClient.del('online_users');
    const channels = ['matchmaking'];
    // Validates all users with pusher
    await pusherServer.trigger(channels, 'Validating all Users', { message: 'Getting all current users' });

    return NextResponse.json({ message: 'Success' });
}
