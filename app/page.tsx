'use client';
import MainPage from './components/MainPage';
import PusherClient from 'pusher-js';

export default function Home() {
    const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_Pusher_key!, {
        cluster: 'us2',
    });

    const handleConnect = () => {
        pusherClient.connect();
        pusherClient.subscribe('channel').bind('text', (msg: any) => {
            console.log(msg);
        });
    };
    const handleDisconnect = () => {
        pusherClient.disconnect();
    };

    return (
        <main className='flex min-h-screen flex-col items-center justify-between p-24'>
            <h1>HELLO</h1>
            <div className='flex flex-col gap-3'>
                <button onClick={handleConnect} className='bg-blue-500 p-3 rounded-2xl'>
                    Connect
                </button>

                <button onClick={handleDisconnect} className='bg-red-500 p-3 rounded-2xl'>
                    Disconnect
                </button>
            </div>
        </main>
    );
}
