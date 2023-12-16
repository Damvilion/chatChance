import { NextResponse } from 'next/server';
import { redisClient } from '@/app/lib/redis';

export async function POST(request: Request) {
    // Get the socket ID from the request body
    const body = await request.json();
    // Add the socket ID to the online_users set | this is to add the user to the matchmaking pool
    try {
        await redisClient.sAdd('online_users', body.socket_id);
        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        console.error('Error adding socket ID to online_users set:', error);
        return NextResponse.json({ message: 'Failed', error, status: 400 });
    }
}
