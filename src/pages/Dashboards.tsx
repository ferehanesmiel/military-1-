import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { userData } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {userData?.name}</h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <p><strong>Role:</strong> {userData?.role}</p>
        <p><strong>Rank:</strong> {userData?.rank}</p>
      </div>
    </div>
  );
};

export const AdminDashboard = () => <div><h1 className="text-3xl font-bold">Admin Dashboard</h1></div>;
export const CommanderDashboard = () => <div><h1 className="text-3xl font-bold">Commander Dashboard</h1></div>;
export const OfficerDashboard = () => <div><h1 className="text-3xl font-bold">Officer Dashboard</h1></div>;
export const StaffDashboard = () => <div><h1 className="text-3xl font-bold">Staff Dashboard</h1></div>;
