import { Link, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-stone-100">
      <nav className="w-64 bg-stone-900 text-white p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">Military Org</h1>
        <div className="flex-1">
          <Link to="/" className="block py-2 hover:text-stone-300">Dashboard</Link>
          <Link to="/personnel" className="block py-2 hover:text-stone-300">Personnel</Link>
          <Link to="/units" className="block py-2 hover:text-stone-300">Units</Link>
          <Link to="/materials" className="block py-2 hover:text-stone-300">Materials</Link>
          <Link to="/analysis" className="block py-2 hover:text-stone-300">Analysis</Link>
          <Link to="/reports" className="block py-2 hover:text-stone-300">Reports</Link>
          {userData?.role === 'admin' && <Link to="/admin" className="block py-2 hover:text-stone-300">Admin Panel</Link>}
        </div>
        <button onClick={handleLogout} className="text-left hover:text-stone-300">Logout</button>
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};
