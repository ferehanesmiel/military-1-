import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { HierarchyTree } from '../components/HierarchyTree';

export const Personnel = () => {
  const { user, loading, userData } = useAuth();
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
    if (loading || !user) return;

    const q = query(collection(db, 'personnel'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPersonnel(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'personnel'));
    return unsubscribe;
  }, [user, loading]);

  const getSupervisors = (id: string, allPersonnel: any[]): string[] => {
    const person = allPersonnel.find(p => p.id === id);
    if (!person || !person.supervisorId) return [];
    return [person.supervisorId, ...getSupervisors(person.supervisorId, allPersonnel)];
  };

  const [attendance, setAttendance] = useState(100);
  const [training, setTraining] = useState(100);
  const [tasks, setTasks] = useState(100);
  const [discipline, setDiscipline] = useState(100);

  const calculateScore = (att: number, tr: number, tsk: number, disc: number) => {
    return (att * 0.3) + (tr * 0.2) + (tsk * 0.3) + (disc * 0.2);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const performanceScore = calculateScore(attendance, training, tasks, discipline);
    const data = { 
      name, rank, branch, department, supervisorId, status, 
      attendance, training, tasks, discipline, performanceScore 
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'personnel', editingId), data);
      } else {
        await addDoc(collection(db, 'personnel'), data);
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'personnel');
      alert('Error saving personnel data. Please check permissions.');
    }
  };

  const resetForm = () => {
    setName(''); setRank(''); setBranch(''); setDepartment(''); setSupervisorId(''); setStatus('Active'); setEditingId(null);
    setAttendance(100); setTraining(100); setTasks(100); setDiscipline(100);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'personnel', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'personnel');
      }
    }
  };

  const getSubordinates = (id: string, allPersonnel: any[]): string[] => {
    const subordinates = allPersonnel.filter(p => p.supervisorId === id);
    let result = subordinates.map(p => p.id);
    subordinates.forEach(s => {
      result = [...result, ...getSubordinates(s.id, allPersonnel)];
    });
    return result;
  };

  const filteredPersonnel = personnel.filter(p => {
    const isSelf = p.id === userData?.uid;
    const subordinates = getSubordinates(userData?.uid, personnel);
    const isSubordinate = subordinates.includes(p.id);
    
    // Admin sees all, others see self and subordinates
    if (userData?.role === 'admin') return p.name.toLowerCase().includes(search.toLowerCase()) && (filterRank === '' || p.rank === filterRank);
    
    return (isSelf || isSubordinate) &&
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterRank === '' || p.rank === filterRank);
  });

  const canAdd = userData?.role === 'admin' || userData?.role === 'commander';
  
  const canEditRecord = (record: any) => {
    if (userData?.role === 'admin') return true;
    if (userData?.role === 'commander') {
      // Commander can edit self or subordinates
      const subordinates = getSubordinates(userData?.uid, personnel);
      return record.id === userData?.uid || subordinates.includes(record.id);
    }
    return false;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Personnel Management</h1>
        {canAdd && !isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Add Personnel
          </button>
        )}
      </div>
      
      {canAdd && isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-stone-200">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Personnel</h2>
          <form onSubmit={handleSubmit}>
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
              <div className="col-span-2 grid grid-cols-4 gap-4 mt-2">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-stone-500">Attendance (%)</label>
                  <input type="number" value={attendance} onChange={e => setAttendance(Number(e.target.value))} className="p-2 border rounded" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-stone-500">Training (%)</label>
                  <input type="number" value={training} onChange={e => setTraining(Number(e.target.value))} className="p-2 border rounded" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-stone-500">Tasks (%)</label>
                  <input type="number" value={tasks} onChange={e => setTasks(Number(e.target.value))} className="p-2 border rounded" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-stone-500">Discipline (%)</label>
                  <input type="number" value={discipline} onChange={e => setDiscipline(Number(e.target.value))} className="p-2 border rounded" />
                </div>
              </div>
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
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPersonnel.map(p => (
            <tr key={p.id} className="border-b hover:bg-stone-50">
              <td className="p-4">{p.name}</td>
              <td className="p-4">{p.rank}</td>
              <td className="p-4">{p.branch}</td>
              <td className="p-4">{p.department}</td>
              <td className="p-4">{p.status}</td>
              <td className="p-4 flex gap-2">
                {canEditRecord(p) ? (
                  <>
                    <button onClick={() => { 
                      setEditingId(p.id); setName(p.name); setRank(p.rank); setBranch(p.branch); setDepartment(p.department); setSupervisorId(p.supervisorId || ''); setStatus(p.status);
                      setAttendance(p.attendance || 100); setTraining(p.training || 100); setTasks(p.tasks || 100); setDiscipline(p.discipline || 100);
                      setIsFormOpen(true);
                    }} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </>
                ) : (
                  <span className="text-stone-400 text-xs italic">View Only</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mb-4">Chain of Command</h2>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <HierarchyTree personnel={personnel} supervisorId={userData?.role === 'admin' ? null : userData?.uid} />
      </div>
    </div>
  );
};
