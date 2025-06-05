import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StreamList = () => {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/streams/live').then((res) => {
      setStreams(res.data);
    });
  }, []);
  console.log(streams);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">📡 Live Streams</h2>

      {streams.length === 0 ? (
        <p className="text-center text-gray-500">No live streams currently available.</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((s) => (
            <div
              key={s.streamKey}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.description}</p>
              </div>

              <div className="flex justify-end mt-auto">
                <Link
                  to={`/watch/${s.streamKey}`}
                  className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  🎥 Watch
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreamList;
