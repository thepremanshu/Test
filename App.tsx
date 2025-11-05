
import React, { useState, useEffect } from 'react';
// FIX: Isolate type imports to prevent module loading race conditions.
// FIX: The User type is not a named export. Import the firebase namespace to access it.
import type firebase from 'firebase/compat/app';
import { auth, db } from './firebase';
import type { CurrentUser } from './types';
import { AuthContext } from './types';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AuthModal from './components/common/AuthModal';
import SupportWidget from './SupportWidget';
import StaticPage from './components/StaticPage';
import LoadingScreen from './components/common/LoadingScreen';
import { AnimatePresence } from 'framer-motion';
import ChatbotWidget from './components/ChatbotWidget';

type Page = 'home' | '12th Board' | 'JEE' | 'admin' | 'about' | 'terms' | 'support';

// FIX: Switched from React.FC to a standard functional component to avoid potential type issues with framer-motion.
const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('home');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsInitialLoading(false);
    }, 2000); // Show loading screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // FIX: Use auth.onAuthStateChanged for v8 compat API
    const unsubscribe = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      if (user) {
        // Special admin check hardcoded as per prompt
        if (user.email === 'thepremanshu@gmail.com') {
           // FIX: Create a plain user object to avoid issues with spreading non-enumerable properties from the Firebase auth object.
           setCurrentUser({ uid: user.uid, email: user.email, isAdmin: true });
           setPage('admin');
        } else {
          // Check for role in Firestore for other users
          // FIX: Use v8 compat API for Firestore
          const userDocRef = db.collection('users').doc(user.uid);
          const userDoc = await userDocRef.get();
          const isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';
          // FIX: Create a plain user object to avoid issues with spreading non-enumerable properties from the Firebase auth object. This ensures 'uid' is correctly passed down.
          setCurrentUser({ uid: user.uid, email: user.email, isAdmin });
          if(isAdmin) {
            setPage('admin');
          }
        }
      } else {
        setCurrentUser(null);
        setPage('home');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const renderPage = () => {
    switch (page) {
      case 'admin':
        return currentUser?.isAdmin ? <AdminPanel /> : <HomePage category="all" />;
      case '12th Board':
      case 'JEE':
        return <HomePage category={page} />;
      case 'about':
        return <StaticPage pageName="about" />;
      case 'terms':
        return <StaticPage pageName="terms" />;
      case 'support':
         return <StaticPage pageName="support" />;
      case 'home':
      default:
        return <HomePage category="all" />;
    }
  };

  if (isInitialLoading) {
      return <LoadingScreen />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-dark">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-red"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, openAuthModal: () => setAuthModalOpen(true) }}>
      <div className="min-h-screen bg-brand-dark font-sans flex flex-col">
        <Header setPage={setPage} currentPage={page} />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <ChatbotWidget />
        <SupportWidget />
        <Footer setPage={setPage} />
        <AnimatePresence>
          {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
};

export default App;