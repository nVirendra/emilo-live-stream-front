import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-900 text-white py-4 px-6 shadow mb-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/">MERN Live Streaming</Link>
        </h1>
        <nav className="flex gap-6">
          <Link to="/" className="hover:text-blue-300">Live Streams</Link>
          <Link to="/create" className="hover:text-green-300">Create Stream</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
