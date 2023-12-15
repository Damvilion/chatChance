import { NextResponse } from 'next/server';
import { redisClient } from '@/app/lib/redis';

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await redisClient.sRem('online_users', body.socket_id);
        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        console.error('Error adding socket ID to online_users set:', error);
        return NextResponse.json({ message: 'Failed' });
    }
}
