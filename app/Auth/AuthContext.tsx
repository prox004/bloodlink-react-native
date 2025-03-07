import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from './config/firebase';
import { User as FirebaseUser } from '@firebase/auth-types';
import { DocumentData } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: DocumentData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  updateUserData: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        setUserData(userDoc.data() || null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Update user data
  const updateUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await auth.signOut();
      setUserData(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Check for stored user data
    const bootstrapAsync = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          // You might want to validate the stored user data here
          console.log('Found stored user data');
        }
      } catch (error) {
        console.error('Error reading stored user data:', error);
      }
    };

    bootstrapAsync();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserData(firebaseUser.uid);
        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        }));
      } else {
        setUser(null);
        setUserData(null);
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for real-time updates to user data
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = db.collection('users')
      .doc(user.uid)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            setUserData(doc.data() || null);
          }
        },
        (error) => {
          console.error('Error listening to user data:', error);
        }
      );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const value = {
    user,
    userData,
    loading,
    signOut,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 