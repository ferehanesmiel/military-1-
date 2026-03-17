import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const fetchReportData = async (collectionName: string, userData: any) => {
  let q = query(collection(db, collectionName));
  
  // Role-based filtering
  if (userData.role === 'commander') {
    q = query(collection(db, collectionName), where('unitId', '==', userData.unitId));
  } else if (userData.role === 'officer') {
    q = query(collection(db, collectionName), where('personnelId', '==', userData.uid));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
