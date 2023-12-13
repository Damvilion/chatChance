import { NextResponse } from 'next/server';
import { redisClient } from '@/app/lib/redis';

export async function POST(request: Request) {
    const body = await request.json();

    await redisClient.sAdd('online_users', body.socket_id);

    return NextResponse.json({ message: 'Success' });
}
