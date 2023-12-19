'use client';
import React from 'react';
import '@livekit/components-styles';
import { useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useParticipants } from '@livekit/components-react';

interface VideoRoomProps {
    matched_user: string;
    stopMatching: () => void;
    startMatch: () => void;
    loading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VideoRoom = ({ matched_user, stopMatching, startMatch, loading }: VideoRoomProps) => {
    const trackRefs = useTracks([Track.Source.Camera]);
    // const audioTrack = useTracks([Track.Source.Microphone]);
    const cameraTracks = trackRefs[0];
    const user2CameraTrack = trackRefs[1] ? trackRefs[1] : null;
    const participants = useParticipants();
    const participantCheck = () => {
        if (Object.keys(participants).length >= 2) {
            stopMatching();
        } else {
            return;
        }
    };

    return (
        <div className='flex flex-col w-full items-center p-3'>
            <div className='min-h-[200px] h-[200px] w-[80%] sm:h-[215px] md:h-[350px]'>
                {user2CameraTrack ? (
                    <VideoTrack
                        className='object-fit w-full h-full'
                        // style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        trackRef={user2CameraTrack}
                    />
                ) : (
                    <video className='object-fit w-full h-full bg-slate-800'></video>
                )}
            </div>

            <div className='min-h-[200px] h-[200px] w-[80%] sm:h-[215px] md:h-[350px]'>
                {cameraTracks ? (
                    <VideoTrack className='object-fit w-full h-full' trackRef={cameraTracks} />
                ) : (
                    <video className='object-fit w-full h-full bg-slate-800'></video>
                )}
            </div>

            <div className='flex gap-4 justify-center items-end p-5'>
                <button className='bg-red-500 p-3 rounded-lg' onClick={participantCheck}>
                    stop matching
                </button>
                <button className={`${loading ? 'bg-slate-500' : 'bg-blue-400'} p-3 rounded-lg`} onClick={startMatch}>
                    Start Match
                </button>
            </div>
        </div>
    );
};

export default VideoRoom;
