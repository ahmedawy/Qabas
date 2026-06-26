import { useState, useEffect } from 'react';
import { api } from '../api/client';

export interface User {
  id: number;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.getUser()
        .then((res) => {
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('auth_token');
          }
        })
        .catch((err) => {
          console.error('Auth error', err);
          localStorage.removeItem('auth_token');
        });
    }
  }, []);

  const handleLogout = async (onLogoutSuccess?: () => void) => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsBookmarksOpen(false);
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    }
  };

  return {
    user,
    setUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isBookmarksOpen,
    setIsBookmarksOpen,
    handleLogout,
  };
}
