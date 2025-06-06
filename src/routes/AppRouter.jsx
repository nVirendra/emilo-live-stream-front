import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/feed/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import Logout from '../pages/auth/Logout';
import UserProfile from '../pages/profile/[userId]';
import LiveStreamCamera from '../LiveStreamCamera';
import StreamList from '../StreamList';
import WatchStream from '../[streamKey]';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/live-streams" element={<StreamList />} />
        <Route path="/go-live" element={<LiveStreamCamera />} />
        <Route path="/watch/:streamKey" element={<WatchStream />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;