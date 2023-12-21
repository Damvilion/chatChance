'use client';
import React, { useEffect } from 'react';
import '@livekit/components-styles';
import { useTracks, VideoTrack, useConnectionState, AudioTrack } from '@livekit/components-react';
import { Track, LocalVideoTrack } from 'livekit-client';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { Button } from '@nextui-org/react';

interface VideoRoomProps {
    loading: boolean;
    startMatch: () => void;
    stopAllMatching: (withLiveKit: boolean) => void;
    mediaStream: MediaStream | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VideoRoom = ({ loading, startMatch, stopAllMatching, mediaStream }: VideoRoomProps) => {
    const localParticipant = useLocalParticipant();

    const connectionState = useConnectionState();

    // Video and audio Feed from livekit room
    const trackRefs = useTracks([Track.Source.Unknown]);
    const audioTrack = useTracks([Track.Source.Microphone]);

    // Video and audio Feed from second user
    const user2CameraTrack = trackRefs[1] ? trackRefs[1] : null;
    const user2AudioTrack = audioTrack[1] ? audioTrack[1] : null;

    // Gets the participants in the LiveKit Room
    const participants = useParticipants();

    // Checks if there are more than 2 participants in the room
    const participantCheck = () => {
        // If there are more than 2 participants in the room, stop all matching
        if (Object.keys(participants).length >= 2) {
            // if in LiveKit Room | Disconnect from LiveKit
            stopAllMatching(true);
        } else {
            stopAllMatching(false);
            return;
        }
    };

    useEffect(() => {
        const connect = async () => {
            if (connectionState === 'connected' && mediaStream) {
                try {
                    const localVideoTrack = new LocalVideoTrack(mediaStream!.getVideoTracks()[0]);
                    await localParticipant.localParticipant.publishTrack(localVideoTrack);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        connect();
    }, [connectionState]);

    // const logTracks = () => {
    //     console.log('Tracks: ', trackRefs);
    //     console.log('Audio: ', audioTrack);
    //     console.log(user2AudioTrack);
    // };

    return (
        <div className='w-full h-full flex flex-col'>
            {user2AudioTrack && <AudioTrack trackRef={user2AudioTrack} />}
            {/* <div className='min-h-[200px] h-[200px] w-[80%] sm:h-[215px] md:h-[350px]'> */}
            {user2CameraTrack ? (
                <VideoTrack className='object-cover w-full h-full rounded-sm' trackRef={user2CameraTrack} />
            ) : (
                <video className='object-cover w-full h-full rounded-sm bg-slate-800'></video>
            )}

            {/* Buttons */}

            <div className='flex gap-4 justify-center items-end'>
                <Button size='sm' color='danger' onClick={participantCheck}>
                    Stop
                </Button>

                <Button size='sm' color='secondary' isLoading={loading} onClick={startMatch}>
                    Start Match
                </Button>
                {/* <Button onClick={logTracks}>Log Tracks</Button> */}
            </div>
        </div>
    );
};

export default VideoRoom;
