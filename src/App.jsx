
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
        <AppRouter/>
        <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
