import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user, loading, userData } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    if (loading || !user) return;

    const unsubMaterials = onSnapshot(collection(db, 'materials'), (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'materials'));

    const unsubPersonnel = onSnapshot(collection(db, 'personnel'), (snapshot) => {
      setPersonnel(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'personnel'));

    const unsubUnits = onSnapshot(collection(db, 'units'), (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'units'));

    return () => { unsubMaterials(); unsubPersonnel(); unsubUnits(); };
  }, [user, loading]);

  const lowStock = materials.filter(m => m.quantity < 5);
  const damaged = materials.filter(m => m.condition === 'Damaged');
  const maintenanceNeeded = materials.filter(m => m.condition === 'Needs Maintenance');
  const lowPerformance = personnel.filter(p => p.performanceScore < 60);
  const lowReadiness = units.filter(u => u.readinessScore < 70);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Welcome, {userData?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-stone-900">
          <h2 className="text-xl font-bold text-stone-600">Total Personnel</h2>
          <p className="text-4xl font-black">{personnel.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-stone-900">
          <h2 className="text-xl font-bold text-stone-600">Total Units</h2>
          <p className="text-4xl font-black">{units.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-stone-900">
          <h2 className="text-xl font-bold text-stone-600">Total Materials</h2>
          <p className="text-4xl font-black">{materials.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full"></span>
            Critical Alerts
          </h2>
          <div className="space-y-4">
            {lowStock.length > 0 && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <strong>Low Stock:</strong> {lowStock.length} items are below critical levels.
              </div>
            )}
            {lowPerformance.length > 0 && (
              <div className="p-4 bg-orange-50 text-orange-700 rounded-lg">
                <strong>Low Performance:</strong> {lowPerformance.length} personnel scoring below 60%.
              </div>
            )}
            {lowReadiness.length > 0 && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <strong>Unit Readiness:</strong> {lowReadiness.length} units below operational standards.
              </div>
            )}
            {maintenanceNeeded.length > 0 && (
              <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
                <strong>Maintenance:</strong> {maintenanceNeeded.length} items require immediate attention.
              </div>
            )}
            {lowStock.length === 0 && lowPerformance.length === 0 && lowReadiness.length === 0 && (
              <p className="text-stone-500 italic">No critical alerts at this time.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Unit Status Overview</h2>
          <div className="space-y-4">
            {units.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border-b">
                <span>{u.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${u.readinessScore > 80 ? 'bg-green-500' : u.readinessScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${u.readinessScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{u.readinessScore}%</span>
                </div>
              </div>
            ))}
            {units.length === 0 && <p className="text-stone-500 italic">No units registered.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = () => <div><h1 className="text-3xl font-bold">Admin Dashboard</h1></div>;
export const CommanderDashboard = () => <div><h1 className="text-3xl font-bold">Commander Dashboard</h1></div>;
export const OfficerDashboard = () => <div><h1 className="text-3xl font-bold">Officer Dashboard</h1></div>;
export const StaffDashboard = () => <div><h1 className="text-3xl font-bold">Staff Dashboard</h1></div>;
