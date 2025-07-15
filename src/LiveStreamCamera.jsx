// ============================================
// FRONTEND - LiveStreamCamera.jsx
// ============================================
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from './utils/constants';
import MainLayout from './layouts/MainLayout';

const socket = io(`${API_BASE_URL}`, {
  transports: ['websocket'],
  timeout: 20000,
  forceNew: true,
});

const LiveStreamCamera = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [streamKey, setStreamKey] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Socket connection status
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('stream-started', ({ streamKey }) => {
      console.log('🎬 Stream started successfully:', streamKey);
    });

    socket.on('stream-error', ({ error }) => {
      console.error('❌ Stream error:', error);
      alert('Stream error: ' + error);
      stopStream();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('stream-started');
      socket.off('stream-error');
    };
  }, []);

  // Fetch existing streams on component mount
  useEffect(() => {
    const fetchFirstStream = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/streams/live`);
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

      // Create stream record in database
      const res = await axios.post(`${API_BASE_URL}/api/streams/create`, {
        title: 'Live Stream',
        description: 'Browser-based live stream',
        isLive: true,
      });

      const newStreamKey = res.data.streamKey;
      setStreamKey(newStreamKey);

      // Get user media with proper constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      // Initialize MediaRecorder with optimized settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data availability
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`📦 Sending chunk: ${event.data.size} bytes`);
          
          // Convert blob to array buffer and send via socket
          event.data.arrayBuffer().then((buffer) => {
            if (socket.connected) {
              socket.emit('stream-chunk', {
                streamKey: newStreamKey,
                chunk: buffer,
                timestamp: Date.now()
              });
            }
          }).catch(err => {
            console.error('❌ Error converting blob to buffer:', err);
          });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event.error);
        stopStream();
      };

      mediaRecorder.onstop = () => {
        console.log('🛑 MediaRecorder stopped');
        setIsStreaming(false);
      };

      // Start recording with 500ms chunks for low latency
      mediaRecorder.start(500);
      setIsStreaming(true);

      // Notify server that stream is starting
      socket.emit('start-stream', { streamKey: newStreamKey });

    } catch (err) {
      console.error('❌ Stream creation error:', err);
      alert('Failed to start stream: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (streamKey) {
      socket.emit('stop-stream', { streamKey });
    }

    setIsStreaming(false);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 mt-8">
        <h2 className="text-3xl font-bold text-center mb-6">🎥 Live Stream Studio</h2>
        
        {/* Connection Status */}
        <div className="text-center mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        {/* Camera Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={true}
              mirrored={true}
              className="rounded-lg border-2 border-gray-300 shadow-lg w-full max-w-2xl"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user"
              }}
            />
            {isStreaming && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔴 LIVE
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={startStream} 
            disabled={isStreaming || loading || connectionStatus !== 'connected'} 
            className="px-8 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Starting...' : isStreaming ? 'Streaming...' : 'Start Stream'}
          </button>
          
          {isStreaming && (
            <button 
              onClick={stopStream} 
              className="px-8 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Stop Stream
            </button>
          )}
        </div>

        {/* Stream Info */}
        {streamKey && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-700 mb-2">
              🔑 Stream Key: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{streamKey}</span>
            </p>
            {isStreaming && (
              <p className="text-green-600 font-medium">
                📺 Your stream is live! Share this link: 
                <a 
                  href={`/watch/${streamKey}`} 
                  className="text-blue-600 hover:text-blue-800 ml-2 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Stream
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LiveStreamCamera;