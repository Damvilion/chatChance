'use client';
import React, { useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
let socket: Socket;

const Page = () => {
    const matchmakingconnection = async () => {
        const connection = await fetch('/api/findmatch');
        console.log(connection);

        socket = io();

        socket.on('connect', () => {
            console.log('connected');
        });
        socket.on('disconnect', (reason) => {
            console.log(`The reason is ${reason}`);
        });
    };

    // useEffect(() => {
    //     matchmakingconnection();
    // }, []);

    const handleConnection = () => {
        matchmakingconnection();
    };

    const handleDisconnect = () => {
        socket.disconnect();
    };

    return (
        <main className='flex flex-col h-screen justify-center items-center gap-5'>
            <h1>Page</h1>
            <button className='bg-blue-500 p-3 rounded-3xl' onClick={handleConnection}>
                Connect
            </button>

            <button className='bg-blue-500 p-3 rounded-3xl' onClick={handleDisconnect}>
                disconnect
            </button>
        </main>
    );
};

export default Page;
