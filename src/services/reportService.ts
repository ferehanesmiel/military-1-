import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const fetchReportData = async (collectionName: string, userData: any, filters: any) => {
  let q = query(collection(db, collectionName));
  
  // Role-based filtering
  if (userData.role === 'commander') {
    q = query(collection(db, collectionName), where('unitId', '==', userData.unitId));
  } else if (userData.role === 'officer') {
    q = query(collection(db, collectionName), where('personnelId', '==', userData.uid));
  }
  
  const snapshot = await getDocs(q);
  let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Apply extra filters
  if (filters.branch) data = data.filter((item: any) => item.branch === filters.branch);
  if (filters.department) data = data.filter((item: any) => item.department === filters.department);
  if (filters.unitId) data = data.filter((item: any) => item.unitId === filters.unitId);
  
  return data;
};
