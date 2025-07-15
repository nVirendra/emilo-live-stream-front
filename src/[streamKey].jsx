

// ============================================
// FRONTEND - WatchStream.jsx
// ============================================
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Hls from 'hls.js';
import { API_BASE_URL } from './utils/constants';
import MainLayout from './layouts/MainLayout';

const WatchStream = () => {
  const videoRef = useRef();
  const hlsRef = useRef();
  const { streamKey } = useParams();
  const [streamStatus, setStreamStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!streamKey || !videoRef.current) return;

    const video = videoRef.current;
    const hlsUrl = `${API_BASE_URL}/hls/${streamKey}/index.m3u8`;

    console.log('🎬 Loading HLS stream:', hlsUrl);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        liveDurationInfinity: true,
        debug: false
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest parsed');
        setStreamStatus('ready');
        video.play().catch(err => {
          console.log('Auto-play blocked, user interaction required');
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - stream may be offline');
              setStreamStatus('error');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - trying to recover');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error occurred');
              setStreamStatus('error');
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.BUFFER_APPENDED, () => {
        if (streamStatus !== 'playing') {
          setStreamStatus('playing');
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari support
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setStreamStatus('ready');
      });
      video.addEventListener('error', () => {
        setError('Failed to load stream');
        setStreamStatus('error');
      });
    } else {
      setError('HLS not supported in this browser');
      setStreamStatus('error');
    }
  }, [streamKey]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full space-y-6 bg-white shadow-xl rounded-xl p-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🎬 Live Stream Viewer
            </h2>
            <p className="text-gray-600">
              Stream: <span className="font-mono text-blue-600">{streamKey}</span>
            </p>
          </div>

          {/* Stream Status */}
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              streamStatus === 'playing' ? 'bg-green-100 text-green-800' :
              streamStatus === 'ready' ? 'bg-yellow-100 text-yellow-800' :
              streamStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {streamStatus === 'playing' && '🟢 Live'}
              {streamStatus === 'ready' && '🟡 Ready'}
              {streamStatus === 'loading' && '⏳ Loading...'}
              {streamStatus === 'error' && '🔴 Error'}
            </span>
          </div>

          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              controls
              autoPlay
              muted={false}
              playsInline
              className="w-full aspect-video"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23000'/%3E%3Ctext x='400' y='225' fill='%23fff' text-anchor='middle' font-size='24' font-family='Arial'%3ELoading Stream...%3C/text%3E%3C/svg%3E"
            />
            
            {streamStatus === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <button
                  onClick={handlePlay}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all"
                >
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ▶️ Play
            </button>
            <button
              onClick={handleFullscreen}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔲 Fullscreen
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WatchStream;