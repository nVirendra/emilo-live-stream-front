// LiveStreamCamera.jsx (Frontend) - Ensure MediaRecorder sends proper format

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const LiveStreamCamera = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [streamKey, setStreamKey] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchFirstStream = async () => {
      try {;
        const response = await axios.get('http://localhost:5000/api/streams/live');
        if (response.data && response.data.length > 0) {
          const firstLiveStream = response.data[0];
          setStreamKey(firstLiveStream.streamKey);
        } else {
          console.log('ℹ️ No live streams available');
        }
      } catch (err) {
        console.error('❌ Failed to fetch live streams:', err);
      }
    };

    fetchFirstStream();
  }, []);
  

  const startStream = async () => {
    try {
      setLoading(true);

      const res = await axios.post('http://localhost:5000/api/streams/create', {
        title: 'Test Stream',
        description: 'Live stream from browser',
        isLive: true,
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStreamKey(res.data.streamKey);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          console.log('Sending chunk:', e.data.size);
          e.data.arrayBuffer().then((buffer) => {
            socket.emit('stream-chunk', {
              streamKey: res.data.streamKey,
              chunk: buffer,
            });
          });
        }
      };

      mediaRecorder.start(1000); // chunk every second
      setIsStreaming(true);
    } catch (err) {
      console.error('Stream creation error:', err);
      alert('Failed to start stream');
    } finally {
      setLoading(false);
    }
  };

  const stopStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsStreaming(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 mt-8">
      <h2 className="text-2xl font-bold text-center">🎥 Live Stream Creator</h2>
      <div className="flex justify-center mb-4">
        <Webcam
          ref={webcamRef}
          audio={true}
          mirrored
          className="rounded-md border shadow-md w-full max-w-md"
        />
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={startStream} disabled={isStreaming || loading} className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700">
          {loading ? 'Starting...' : isStreaming ? 'Streaming...' : 'Start Stream'}
        </button>
        {isStreaming && (
          <button onClick={stopStream} className="px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700">
            Stop Stream
          </button>
        )}
      </div>
      {streamKey && (
        <div className="mt-4 text-center">
          <p className="text-gray-700">🔑 <span className="font-mono">{streamKey}</span></p>
        </div>
      )}
    </div>
  );
};

export default LiveStreamCamera;
