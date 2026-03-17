import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const Materials = () => {
  const { userData } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [assignedTo, setAssignedTo] = useState('');
  const [condition, setCondition] = useState('Good');
  const [location, setLocation] = useState('');
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'materials'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, type, quantity: Number(quantity), assignedTo, condition, location, lastMaintenance };
    if (editingId) {
      await updateDoc(doc(db, 'materials', editingId), data);
    } else {
      await addDoc(collection(db, 'materials'), data);
    }
    setName(''); setType(''); setQuantity(0); setAssignedTo(''); setCondition('Good'); setLocation(''); setLastMaintenance(''); setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) await deleteDoc(doc(db, 'materials', id));
  };

  const canEdit = userData?.role === 'admin' || userData?.role === 'commander';

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Materials & Logistics</h1>
      
      {canEdit && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Material</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded" required />
            <input placeholder="Type" value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded" required />
            <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="p-2 border rounded" required />
            <input placeholder="Assigned To" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="p-2 border rounded" />
            <select value={condition} onChange={e => setCondition(e.target.value)} className="p-2 border rounded">
              <option>Good</option>
              <option>Damaged</option>
              <option>Needs Maintenance</option>
            </select>
            <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="p-2 border rounded" required />
            <input type="date" value={lastMaintenance} onChange={e => setLastMaintenance(e.target.value)} className="p-2 border rounded" />
          </div>
          <button type="submit" className="mt-4 bg-stone-900 text-white p-2 rounded">{editingId ? 'Update' : 'Add'}</button>
        </form>
      )}

      <table className="w-full bg-white rounded-xl shadow-md">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Type</th>
            <th className="p-4 text-left">Quantity</th>
            <th className="p-4 text-left">Condition</th>
            <th className="p-4 text-left">Location</th>
            {canEdit && <th className="p-4 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {materials.map(m => (
            <tr key={m.id} className={`border-b ${m.quantity < 5 ? 'bg-red-50' : ''} ${m.condition === 'Damaged' ? 'bg-orange-50' : ''}`}>
              <td className="p-4">{m.name}</td>
              <td className="p-4">{m.type}</td>
              <td className="p-4">{m.quantity}</td>
              <td className="p-4">{m.condition}</td>
              <td className="p-4">{m.location}</td>
              {canEdit && (
                <td className="p-4 flex gap-2">
                  <button onClick={() => { setEditingId(m.id); setName(m.name); setType(m.type); setQuantity(m.quantity); setAssignedTo(m.assignedTo); setCondition(m.condition); setLocation(m.location); setLastMaintenance(m.lastMaintenance); }} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="text-red-600">Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
