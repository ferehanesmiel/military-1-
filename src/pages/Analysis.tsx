import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Analysis = () => {
  const { userData } = useAuth();
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribePersonnel = onSnapshot(collection(db, 'personnel'), (snapshot) => {
      setPersonnel(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubscribeUnits = onSnapshot(collection(db, 'units'), (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubscribePersonnel(); unsubscribeUnits(); };
  }, []);

  const canViewAll = userData?.role === 'admin' || userData?.role === 'commander';
  
  const topPerformers = personnel
    .filter(p => canViewAll || p.id === userData?.uid)
    .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
    .slice(0, 5);

  const lowReadinessUnits = units
    .filter(u => canViewAll || u.commanderId === userData?.uid)
    .filter(u => (u.readinessScore || 0) < 70);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Analysis & Evaluation</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Top Performers</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPerformers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="performanceScore" fill="#1c1917" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Low Readiness Units</h2>
          {lowReadinessUnits.length > 0 ? (
            <ul>
              {lowReadinessUnits.map(u => (
                <li key={u.id} className="mb-2 p-2 border-b text-red-600 font-bold">
                  {u.name}: {u.readinessScore.toFixed(2)}%
                </li>
              ))}
            </ul>
          ) : (
            <p>All units are at acceptable readiness levels.</p>
          )}
        </div>
      </div>
    </div>
  );
};
