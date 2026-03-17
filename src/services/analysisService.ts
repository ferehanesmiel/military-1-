import { db } from './firebase';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

export const calculatePersonnelScore = (attendance: number, training: number, tasks: number, discipline: number) => {
  return (attendance * 0.3) + (training * 0.2) + (tasks * 0.3) + (discipline * 0.2);
};

export const updatePersonnelScore = async (personnelId: string, score: number) => {
  const personnelRef = doc(db, 'personnel', personnelId);
  await updateDoc(personnelRef, { performanceScore: score });
};

export const calculateUnitReadiness = (personnelCount: number, requiredPersonnel: number, equipmentAvailable: number, totalEquipment: number) => {
  const personnelReadiness = Math.min(personnelCount / requiredPersonnel, 1);
  const equipmentReadiness = equipmentAvailable / totalEquipment;
  return (personnelReadiness * 0.5 + equipmentReadiness * 0.5) * 100;
};

export const updateUnitReadiness = async (unitId: string, score: number) => {
  const unitRef = doc(db, 'units', unitId);
  await updateDoc(unitRef, { readinessScore: score });
};
