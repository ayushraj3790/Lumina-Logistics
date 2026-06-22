import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true);
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Call /api/auth/me to get authenticated user (token is in httpOnly cookie)
        const userData = await handleGoogleCallback();
        
        toast.success('Successfully logged in with Google!');
        
        // Redirect to appropriate dashboard
        const dashboardPath = ROLE_DASHBOARD[userData.role] || '/';
        navigate(dashboardPath);
      } catch (error) {
        console.error('Google callback error:', error);
        toast.error('Login failed. Please try again.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [handleGoogleCallback, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-lumina-950 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lumina-600 mx-auto"></div>
          <p className="mt-4 text-white">Completing Google login...</p>
        </div>
      </div>
    );
  }

  return null;
}
