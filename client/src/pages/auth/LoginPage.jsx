import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(ROLE_DASHBOARD[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-lumina-950 to-slate-900 p-4">
      <div className="card w-full max-w-md dark:bg-slate-800/90">
        <Link to="/" className="text-2xl font-bold text-lumina-600">Lumina Logistics</Link>
        <h1 className="text-2xl font-bold mt-6 mb-2">Sign In</h1>
        <p className="text-slate-500 text-sm mb-6">Demo: customer@lumina.com / customer123</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Link to="/forgot-password" className="text-sm text-lumina-600">Forgot password?</Link>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="mt-6 text-center text-sm">No account? <Link to="/register" className="text-lumina-600 font-medium">Register</Link></p>
      </div>
    </div>
  );
}
