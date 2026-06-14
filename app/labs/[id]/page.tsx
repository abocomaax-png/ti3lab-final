import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';

// Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  points: number;
  solvedLabs: string[];
  createdAt: Timestamp;
  avatar?: string;
  isActivated: boolean;
}

export interface Lab {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  difficulty: 'easy' | 'medium' | 'hard';
  track: 'networking' | 'linux' | 'pentesting' | 'web';
  topic: string;
  topicAr: string;
  flag: string;
  points: number;
  dockerFileUrl?: string;    // Firebase Storage download URL for docker-compose.yml or .zip
  setupInstructions?: string; // plain-text setup steps shown on the lab page
  solveCount: number;
  isLocked: boolean;
  order: number;
  createdAt: Timestamp;
  hints?: string[];
}

export interface Submission {
  id: string;
  userId: string;
  labId: string;
  submittedFlag: string;
  isCorrect: boolean;
  timestamp: Timestamp;
}

// User Functions
export async function createUserProfile(uid: string, email: string, displayName: string) {
  const userRef = doc(db, 'users', uid);
  const userData: User = {
    uid,
    email,
    displayName,
    points: 0,
    solvedLabs: [],
    createdAt: Timestamp.now(),
    isActivated: true,
  };
  await setDoc(userRef, userData);
  return userData;
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return userSnap.data() as User;
  return null;
}

export async function getAllUsers(): Promise<User[]> {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map(doc => doc.data() as User);
}

export async function updateUserPoints(uid: string, points: number) {
  await updateDoc(doc(db, 'users', uid), { points });
}

export async function addSolvedLab(uid: string, labId: string) {
  await updateDoc(doc(db, 'users', uid), { solvedLabs: arrayUnion(labId) });
}

// Lab Functions
export async function getAllLabs(): Promise<Lab[]> {
  const labsSnap = await getDocs(collection(db, 'labs'));
  return labsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lab));
}

export async function getLabById(labId: string): Promise<Lab | null> {
  const labSnap = await getDoc(doc(db, 'labs', labId));
  if (labSnap.exists()) return { id: labSnap.id, ...labSnap.data() } as Lab;
  return null;
}

export async function setLabLock(labId: string, isLocked: boolean) {
  await updateDoc(doc(db, 'labs', labId), { isLocked });
}

export async function setMultipleLabsLock(labIds: string[], isLocked: boolean) {
  await Promise.all(labIds.map(id => setLabLock(id, isLocked)));
}

// Submission Functions
export async function submitFlag(
  userId: string,
  labId: string,
  submittedFlag: string,
  correctFlag: string
): Promise<boolean> {
  const isCorrect = submittedFlag.trim() === correctFlag.trim();
  await setDoc(doc(collection(db, 'submissions')), {
    userId,
    labId,
    submittedFlag,
    isCorrect,
    timestamp: Timestamp.now(),
  });
  return isCorrect;
}

export async function incrementLabSolveCount(labId: string) {
  const labSnap = await getDoc(doc(db, 'labs', labId));
  if (labSnap.exists()) {
    const currentCount = labSnap.data().solveCount || 0;
    await updateDoc(doc(db, 'labs', labId), { solveCount: currentCount + 1 });
  }
}

// Leaderboard
export async function getLeaderboard(limitCount: number = 10): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as User);
}

// ── Category Functions ───────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
}

export async function getAllCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
}
