import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  useEffect(() => {
    openAuthModal('register');
    navigate('/', { replace: true });
  }, [openAuthModal, navigate]);

  return null;
}
