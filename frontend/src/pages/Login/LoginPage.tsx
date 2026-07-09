import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  useEffect(() => {
    openAuthModal('login');
    navigate('/', { replace: true });
  }, [openAuthModal, navigate]);

  return null;
}
