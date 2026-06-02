import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data } = await authService.getUserProfile(userId);
    setProfile(data || null);
    return data || null;
  }, []);

  useEffect(() => {
    const applySession = async (session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await refreshProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    const checkSession = async () => {
      const { session } = await authService.getCurrentUser();
      applySession(session);
    };

    checkSession();

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshProfile]);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
