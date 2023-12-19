'use client';
import React from 'react';
import '@livekit/components-styles';
import { useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useParticipants } from '@livekit/components-react';
import { Button } from '@nextui-org/react';

interface VideoRoomProps {
    loading: boolean;
    startMatch: () => void;
    stopAllMatching: () => void;
    stopAllMatchingWithLiveKit: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VideoRoom = ({ loading, startMatch, stopAllMatching, stopAllMatchingWithLiveKit }: VideoRoomProps) => {
    const trackRefs = useTracks([Track.Source.Camera]);
    // const audioTrack = useTracks([Track.Source.Microphone]);
    const cameraTracks = trackRefs[0];
    const user2CameraTrack = trackRefs[1] ? trackRefs[1] : null;
    // Gets the participants in the LiveKit Room
    const participants = useParticipants();
    const participantCheck = () => {
        // If there are more than 2 participants in the room, stop all matching
        if (Object.keys(participants).length >= 2) {
            stopAllMatchingWithLiveKit();
        } else {
            stopAllMatching();
            return;
        }
    };

    return (
        <div className='flex flex-col w-full items-center p-3'>
            <div className='min-h-[200px] h-[200px] w-[80%] sm:h-[215px] md:h-[350px]'>
                {user2CameraTrack ? (
                    <VideoTrack className='object-cover w-full h-full rounded-sm' trackRef={user2CameraTrack} />
                ) : (
                    <video className='object-cover w-full h-full rounded-sm bg-slate-800'></video>
                )}
            </div>

            <div className='min-h-[200px] h-[200px] w-[80%] sm:h-[215px] md:h-[350px]'>
                {cameraTracks ? (
                    <VideoTrack className='object-cover w-full h-full rounded-sm' trackRef={cameraTracks} />
                ) : (
                    <video className='object-cover w-full h-full bg-slate-800'></video>
                )}
            </div>

            {/* Buttons */}
            <div className='flex gap-4 justify-center items-end p-5'>
                <Button color='danger' onClick={participantCheck}>
                    Stop
                </Button>

                <Button color='secondary' isLoading={loading} onClick={startMatch}>
                    Start Match
                </Button>
            </div>
        </div>
    );
};

export default VideoRoom;
