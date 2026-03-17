import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const Units = () => {
  const { user, loading, userData } = useAuth();
  const [units, setUnits] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [commanderId, setCommanderId] = useState('');
  const [personnelCount, setPersonnelCount] = useState(0);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [requiredPersonnel, setRequiredPersonnel] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const unsubUnits = onSnapshot(collection(db, 'units'), (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'units'));

    const unsubPersonnel = onSnapshot(collection(db, 'personnel'), (snapshot) => {
      setPersonnel(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'personnel'));

    return () => { unsubUnits(); unsubPersonnel(); };
  }, [user, loading]);

  const calculateReadiness = (unitId: string, reqPers: number) => {
    const unitPersonnel = personnel.filter(p => p.unitId === unitId);
    const personnelReadiness = Math.min(unitPersonnel.length / reqPers, 1);
    // Simplified: equipment readiness could be added here if materials were linked to units
    return personnelReadiness * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const readinessScore = calculateReadiness(editingId || 'new', requiredPersonnel || 1);
    const data = { 
      name, 
      branch,
      commanderId, 
      personnelCount: Number(personnelCount),
      equipmentCount: Number(equipmentCount),
      requiredPersonnel: Number(requiredPersonnel), 
      readinessScore 
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'units', editingId), data);
      } else {
        await addDoc(collection(db, 'units'), data);
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'units');
      alert('Error saving unit data. Please check permissions.');
    }
  };

  const resetForm = () => {
    setName(''); setBranch(''); setCommanderId(''); setPersonnelCount(0); setEquipmentCount(0); setRequiredPersonnel(0); setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'units', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'units');
      }
    }
  };

  const canEdit = userData?.role === 'admin' || userData?.role === 'commander';

  const canEditRecord = (record: any) => {
    if (userData?.role === 'admin') return true;
    if (userData?.role === 'commander') {
      return record.commanderId === userData?.uid;
    }
    return false;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Unit Management</h1>
        {canEdit && !isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Add Unit
          </button>
        )}
      </div>
      
      {canEdit && isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-stone-200">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Unit</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Unit Name" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded" required />
              <input placeholder="Branch" value={branch} onChange={e => setBranch(e.target.value)} className="p-2 border rounded" required />
              <select value={commanderId} onChange={e => setCommanderId(e.target.value)} className="p-2 border rounded">
                <option value="">Select Commander</option>
                {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" placeholder="Required Personnel" value={requiredPersonnel} onChange={e => setRequiredPersonnel(Number(e.target.value))} className="p-2 border rounded" required />
              <input type="number" placeholder="Personnel Count" value={personnelCount} onChange={e => setPersonnelCount(Number(e.target.value))} className="p-2 border rounded" />
              <input type="number" placeholder="Equipment Count" value={equipmentCount} onChange={e => setEquipmentCount(Number(e.target.value))} className="p-2 border rounded" />
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

      <table className="w-full bg-white rounded-xl shadow-md">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Unit Name</th>
            <th className="p-4 text-left">Branch</th>
            <th className="p-4 text-left">Commander</th>
            <th className="p-4 text-left">Personnel (Current/Req)</th>
            <th className="p-4 text-left">Equipment</th>
            <th className="p-4 text-left">Readiness</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map(u => (
            <tr key={u.id} className="border-b hover:bg-stone-50">
              <td className="p-4">{u.name}</td>
              <td className="p-4">{u.branch || 'N/A'}</td>
              <td className="p-4">{personnel.find(p => p.id === u.commanderId)?.name || 'N/A'}</td>
              <td className="p-4">{u.personnelCount || 0} / {u.requiredPersonnel}</td>
              <td className="p-4">{u.equipmentCount || 0}</td>
              <td className="p-4">
                <span className={`font-bold ${u.readinessScore > 80 ? 'text-green-600' : u.readinessScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {u.readinessScore?.toFixed(2)}%
                </span>
              </td>
              <td className="p-4 flex gap-2">
                {canEditRecord(u) ? (
                  <>
                    <button onClick={() => { 
                      setEditingId(u.id); 
                      setName(u.name); 
                      setBranch(u.branch || '');
                      setCommanderId(u.commanderId || ''); 
                      setPersonnelCount(u.personnelCount || 0);
                      setEquipmentCount(u.equipmentCount || 0);
                      setRequiredPersonnel(u.requiredPersonnel); 
                      setIsFormOpen(true);
                    }} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
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
  );
};
