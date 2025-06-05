import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LiveStreamCamera from './LiveStreamCamera';
import StreamList from './StreamList';
import WatchStream from './[streamKey]';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StreamList />} />
          <Route path="/create" element={<LiveStreamCamera />} />
          <Route path="/watch/:streamKey" element={<WatchStream />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
