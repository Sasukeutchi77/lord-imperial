import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { updatePresence } from '../services/auth';
import { subscribeToNetworkStatus } from '../services/network';

export const usePresence = (uid) => {
  const lastPresenceRef = useRef(null);
  const appStateRef = useRef('active');
  const connectedRef = useRef(true);

  useEffect(() => {
    if (!uid) {
      lastPresenceRef.current = null;
      return undefined;
    }

    let active = true;

    const syncPresence = async () => {
      const nextOnlineState = appStateRef.current === 'active' && connectedRef.current;
      if (!active || lastPresenceRef.current === nextOnlineState) {
        return;
      }

      lastPresenceRef.current = nextOnlineState;

      try {
        await updatePresence(uid, nextOnlineState);
      } catch (_error) {
        // La présence ne doit jamais casser l’application.
      }
    };

    syncPresence();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      appStateRef.current = state;
      syncPresence();
    });

    const unsubscribeNetwork = subscribeToNetworkStatus((isConnected) => {
      connectedRef.current = isConnected;
      syncPresence();
    });

    return () => {
      active = false;
      appStateSubscription.remove();
      unsubscribeNetwork();

      if (lastPresenceRef.current !== false && connectedRef.current) {
        updatePresence(uid, false).catch(() => {});
      }

      lastPresenceRef.current = null;
    };
  }, [uid]);
};
