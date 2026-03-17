import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { HierarchyTree } from '../components/HierarchyTree';

export const Personnel = () => {
  const { userData } = useAuth();
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [rank, setRank] = useState('');
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [status, setStatus] = useState('Active');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRank, setFilterRank] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'personnel'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPersonnel(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const getSupervisors = (id: string, allPersonnel: any[]): string[] => {
    const person = allPersonnel.find(p => p.id === id);
    if (!person || !person.supervisorId) return [];
    return [person.supervisorId, ...getSupervisors(person.supervisorId, allPersonnel)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allSupervisors = getSupervisors(supervisorId, personnel);
    if (editingId) {
      await updateDoc(doc(db, 'personnel', editingId), { name, rank, branch, department, supervisorId, status, allSupervisors });
    } else {
      await addDoc(collection(db, 'personnel'), { name, rank, branch, department, supervisorId, status, allSupervisors });
    }
    setName(''); setRank(''); setBranch(''); setDepartment(''); setSupervisorId(''); setStatus('Active'); setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) await deleteDoc(doc(db, 'personnel', id));
  };

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterRank === '' || p.rank === filterRank)
  );

  const canEdit = userData?.role === 'admin';
  const canAdd = userData?.role === 'admin' || userData?.role === 'commander';

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Personnel Management</h1>
      
      {canAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Personnel</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded" required />
            <input placeholder="Rank" value={rank} onChange={e => setRank(e.target.value)} className="p-2 border rounded" required />
            <input placeholder="Branch" value={branch} onChange={e => setBranch(e.target.value)} className="p-2 border rounded" required />
            <input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} className="p-2 border rounded" required />
            <select value={supervisorId} onChange={e => setSupervisorId(e.target.value)} className="p-2 border rounded">
              <option value="">Select Supervisor</option>
              {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="p-2 border rounded">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <button type="submit" className="mt-4 bg-stone-900 text-white p-2 rounded">{editingId ? 'Update' : 'Add'}</button>
        </form>
      )}

      <div className="mb-4 flex gap-4">
        <input placeholder="Search by name" onChange={e => setSearch(e.target.value)} className="p-2 border rounded" />
        <select onChange={e => setFilterRank(e.target.value)} className="p-2 border rounded">
          <option value="">All Ranks</option>
          <option value="General">General</option>
          <option value="Colonel">Colonel</option>
          <option value="Captain">Captain</option>
        </select>
      </div>

      <table className="w-full bg-white rounded-xl shadow-md mb-8">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Rank</th>
            <th className="p-4 text-left">Branch</th>
            <th className="p-4 text-left">Department</th>
            <th className="p-4 text-left">Status</th>
            {canEdit && <th className="p-4 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredPersonnel.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-4">{p.name}</td>
              <td className="p-4">{p.rank}</td>
              <td className="p-4">{p.branch}</td>
              <td className="p-4">{p.department}</td>
              <td className="p-4">{p.status}</td>
              {canEdit && (
                <td className="p-4 flex gap-2">
                  <button onClick={() => { setEditingId(p.id); setName(p.name); setRank(p.rank); setBranch(p.branch); setDepartment(p.department); setSupervisorId(p.supervisorId || ''); setStatus(p.status); }} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mb-4">Chain of Command</h2>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <HierarchyTree personnel={personnel} supervisorId={null} />
      </div>
    </div>
  );
};
