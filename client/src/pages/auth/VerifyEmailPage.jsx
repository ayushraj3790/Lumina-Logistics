import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [msg, setMsg] = useState('Verifying...');

  useEffect(() => {
    authAPI.verifyEmail(token).then(() => setMsg('Email verified!')).catch(() => setMsg('Invalid or expired link'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card text-center">
        <p className="text-xl font-bold">{msg}</p>
        <Link to="/login" className="text-lumina-600 mt-4 inline-block">Login</Link>
      </div>
    </div>
  );
}
