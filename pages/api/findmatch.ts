import { NextApiRequest, NextApiResponse } from 'next';
import { Server, Socket } from 'socket.io';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if ((res.socket as any).server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Initializing');

        const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>((res.socket as any).server);

        (res.socket as any).server.io = io;

        io.on('connection', (socket: Socket) => {
            console.log('A client conected');
        });
    }
    res.end();
}
