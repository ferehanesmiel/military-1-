import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { userData } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'materials'), (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const lowStock = materials.filter(m => m.quantity < 5);
  const damaged = materials.filter(m => m.condition === 'Damaged');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {userData?.name}</h1>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold">Total Materials</h2>
          <p className="text-4xl">{materials.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold">Low Stock</h2>
          <p className="text-4xl text-red-600">{lowStock.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold">Damaged Items</h2>
          <p className="text-4xl text-orange-600">{damaged.length}</p>
        </div>
      </div>
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
