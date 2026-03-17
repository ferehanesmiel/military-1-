import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const Materials = () => {
  const { user, loading, userData } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [assignedTo, setAssignedTo] = useState('');
  const [unitId, setUnitId] = useState('');
  const [condition, setCondition] = useState('Good');
  const [location, setLocation] = useState('');
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, 'materials'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'materials'));

    const unsubUnits = onSnapshot(collection(db, 'units'), (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'units'));

    return () => { unsubscribe(); unsubUnits(); };
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, type, quantity: Number(quantity), assignedTo, unitId, condition, location, lastMaintenance };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'materials', editingId), data);
      } else {
        await addDoc(collection(db, 'materials'), data);
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'materials');
      alert('Error saving material data. Please check permissions.');
    }
  };

  const resetForm = () => {
    setName(''); setType(''); setQuantity(0); setAssignedTo(''); setUnitId(''); setCondition('Good'); setLocation(''); setLastMaintenance(''); setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'materials', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'materials');
      }
    }
  };

  const canEdit = userData?.role === 'admin' || userData?.role === 'commander';

  const canEditRecord = (record: any) => {
    if (userData?.role === 'admin') return true;
    if (userData?.role === 'commander') {
      // Commander can edit materials assigned to their unit
      const myUnits = units.filter(u => u.commanderId === userData?.uid).map(u => u.id);
      return myUnits.includes(record.unitId);
    }
    return false;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Materials & Logistics</h1>
        {canEdit && !isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Add Material
          </button>
        )}
      </div>
      
      {canEdit && isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-stone-200">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Material</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded" required />
              <input placeholder="Type" value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded" required />
              <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="p-2 border rounded" required />
              <input placeholder="Assigned To" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="p-2 border rounded" />
              <select value={unitId} onChange={e => setUnitId(e.target.value)} className="p-2 border rounded">
                <option value="">Select Unit</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="p-2 border rounded">
                <option>Good</option>
                <option>Damaged</option>
                <option>Needs Maintenance</option>
              </select>
              <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="p-2 border rounded" required />
              <input type="date" value={lastMaintenance} onChange={e => setLastMaintenance(e.target.value)} className="p-2 border rounded" />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded hover:bg-stone-800">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-stone-200 text-stone-700 px-6 py-2 rounded hover:bg-stone-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-md responsive-table">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Quantity</th>
              <th className="p-4 text-left">Unit</th>
              <th className="p-4 text-left">Condition</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.id} className={`border-b hover:bg-stone-50 ${m.quantity < 5 ? 'bg-red-50' : ''} ${m.condition === 'Damaged' ? 'bg-orange-50' : ''}`}>
                <td className="p-4" data-label="Name">{m.name}</td>
                <td className="p-4" data-label="Type">{m.type}</td>
                <td className="p-4" data-label="Quantity">{m.quantity}</td>
                <td className="p-4" data-label="Unit">{units.find(u => u.id === m.unitId)?.name || 'N/A'}</td>
                <td className="p-4" data-label="Condition">{m.condition}</td>
                <td className="p-4" data-label="Location">{m.location}</td>
                <td className="p-4 flex gap-2 actions" data-label="Actions">
                  {canEditRecord(m) ? (
                    <>
                      <button onClick={() => { 
                        setEditingId(m.id); 
                        setName(m.name); 
                        setType(m.type); 
                        setQuantity(m.quantity); 
                        setAssignedTo(m.assignedTo || ''); 
                        setUnitId(m.unitId || '');
                        setCondition(m.condition); 
                        setLocation(m.location); 
                        setLastMaintenance(m.lastMaintenance || ''); 
                        setIsFormOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </>
                  ) : (
                    <span className="text-stone-400 text-xs italic">View Only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
