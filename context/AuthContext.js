import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../services/firebase';
import { checkAndGrantCertification } from '../services/auth';
import { getCachedProfile, preloadCacheForUser, saveCachedProfile } from '../services/offlineStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) {
      setFirebaseUser(null);
      setProfile(null);
      setLoading(false);
      return undefined;
    }

    let active = true;
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        if (!active) return;

        setFirebaseUser(user);
        unsubscribeProfile();

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // Preload disk cache into memory immediately so screens get instant data
        preloadCacheForUser(user.uid).catch(() => {});

        const cachedProfile = await getCachedProfile(user.uid);
        if (active && cachedProfile) {
          setProfile(cachedProfile);
        }

        setLoading(true);
        unsubscribeProfile = onSnapshot(
          doc(db, 'users', user.uid),
          async (snapshot) => {
            if (!active) return;
            const nextProfile = snapshot.exists() ? snapshot.data() : null;
            setProfile(nextProfile);
            if (nextProfile) {
              await saveCachedProfile(user.uid, nextProfile);
              checkAndGrantCertification(user.uid, nextProfile).catch(() => {});
            }
            setLoading(false);
          },
          (error) => {
            console.warn('Échec de synchronisation du profil:', error?.message || error);
            if (!active) return;
            setLoading(false);
          }
        );
      },
      (error) => {
        console.warn('Échec de synchronisation Auth:', error?.message || error);
        if (!active) return;
        setFirebaseUser(null);
        setProfile(null);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      hasUsername: Boolean(profile?.username),
      isAuthenticated: Boolean(firebaseUser),
    }),
    [firebaseUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider.');
  }
  return context;
};
