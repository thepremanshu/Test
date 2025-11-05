import React, { createContext, useContext } from 'react';

// A simplified interface to represent Firestore Timestamps without a direct import,
// breaking a potential module loading cycle.
export interface FirebaseTimestamp {
  toDate(): Date;
}

export interface Course {
  id: string;
  title: string;
  category: '12th Board' | 'JEE';
  thumbnailUrl: string;
  videoUrl: string;
  notesUrl:string;
  createdAt: FirebaseTimestamp;
}

// FIX: Changed from a type alias extending firebase.User to a plain interface
// to avoid issues with spreading non-enumerable properties from the Firebase User object.
export interface CurrentUser {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}

export interface PageContent {
    id: string;
    content: string;
}

export interface ChatMessage {
  id:string;
  text: string;
  senderId: string; // 'admin' or user's UID
  timestamp: FirebaseTimestamp;
}

export interface SupportChat {
  id: string; // Corresponds to the user's UID
  userEmail: string;
  lastMessage: string;
  lastUpdatedAt: FirebaseTimestamp;
  status: 'new' | 'open' | 'resolved';
  unreadByAdmin: boolean;
}

// --- Auth Context ---
export interface AuthContextType {
  currentUser: CurrentUser | null;
  loading: boolean;
  openAuthModal: () => void;
}

export const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true, openAuthModal: () => {} });

export const useAuth = () => useContext(AuthContext);