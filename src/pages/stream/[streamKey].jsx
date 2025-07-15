

// ==== WatchStream.jsx ====
import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Hls from 'hls.js';
import MainLayout from '../../layouts/MainLayout';
import { API_BASE_URL } from '../../utils/constants';

const WatchStream = () => {
  const videoRef = useRef();
  const { streamKey } = useParams();

  useEffect(() => {
    if (!streamKey || !videoRef.current) return;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(`${API_BASE_URL}/hls/${streamKey}.m3u8`);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = `${API_BASE_URL}/hls/${streamKey}.m3u8`;
    }
  }, [streamKey]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-2xl font-bold text-center">🎬 Watching Live Stream</h2>
          <div className="aspect-w-16 aspect-h-9">
            <video ref={videoRef} controls autoPlay muted className="w-full h-full rounded" />
          </div>
          <p className="text-center mt-4 text-gray-600">Stream Key: <span className="text-blue-600 font-mono">{streamKey}</span></p>
        </div>
      </div>
    </MainLayout>
  );
};

export default WatchStream;
