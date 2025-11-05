import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './types';
import { db, firestore } from './firebase';
import type { ChatMessage } from './types';

// FIX: Reverted from function declaration to a const arrow function to resolve framer-motion prop type errors.
const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgentMessage, setShowAgentMessage] = useState(false);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showAgentMessage]);

  useEffect(() => {
    if (isOpen && currentUser) {
      const unsubscribe = db.collection('support_chats').doc(currentUser.uid).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
          const fetchedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ChatMessage));
          setMessages(fetchedMessages);
        });
      
      return () => unsubscribe();
    }
  }, [isOpen, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    setIsSubmitting(true);
    const newMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        text: message,
        senderId: currentUser.uid,
    };
    
    const chatDocRef = db.collection('support_chats').doc(currentUser.uid);
    const messagesColRef = chatDocRef.collection('messages');

    try {
        await messagesColRef.add({
            ...newMessage,
            timestamp: firestore.FieldValue.serverTimestamp(),
        });

        await chatDocRef.set({
            userEmail: currentUser.email,
            lastMessage: message,
            lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
            status: 'open',
            unreadByAdmin: true,
        }, { merge: true });
        
        setMessage('');
        setShowAgentMessage(true);
        setTimeout(() => setShowAgentMessage(false), 4000);

    } catch (error) {
        console.error("Error sending support message:", error);
        alert("Sorry, your message could not be sent. Please try again later.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const renderChatContent = () => {
    if (!currentUser) {
        return (
             <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                <p className="text-gray-300">Please log in to start a chat with our support team.</p>
            </div>
        )
    }
    
    return (
        <>
            <div className="p-4 h-64 flex flex-col space-y-2 overflow-y-auto">
                <div className="p-3 bg-gray-700 rounded-lg self-start max-w-xs">
                    <p className="text-sm">Welcome to APNA ADDA!</p>
                </div>
                 {messages.length === 0 && (
                    <div className="p-3 bg-gray-700 rounded-lg self-start max-w-xs">
                        <p className="text-sm">How can we help you today?</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-lg max-w-xs text-sm ${
                        msg.senderId === currentUser.uid
                        ? 'bg-brand-red self-end'
                        : 'bg-gray-700 self-start'
                    }`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
                 {showAgentMessage && (
                    <div className="p-3 bg-gray-700 rounded-lg self-start max-w-xs">
                        <p className="text-sm">Our agent will shortly assist you...</p>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSubmit}>
                  <input type="text" placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} disabled={isSubmitting} className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50" />
                  <button type="submit" disabled={isSubmitting || !message.trim()} className="w-full mt-2 bg-brand-red py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </form>
            </div>
        </>
    )
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-brand-red text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
        >
          {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          )}
        </motion.button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-5 z-40 w-80 bg-brand-light rounded-2xl shadow-2xl shadow-brand-red/20 overflow-hidden flex flex-col"
          >
            <div className="p-4 bg-gray-800">
              <h3 className="font-bold text-lg">Support Chat</h3>
            </div>
            {renderChatContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportWidget;