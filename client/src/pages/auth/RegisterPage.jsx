import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created! Check email to verify.');
      navigate(ROLE_DASHBOARD[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-lumina-950 to-slate-900 p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field" type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Register as Customer'}</button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400 mb-2">Want to register as a driver?</p>
          <Link to="/register/driver" className="text-lumina-600 font-medium hover:underline">
            Apply as Driver →
          </Link>
        </div>
        
        <p className="mt-4 text-center text-sm">Have an account? <Link to="/login" className="text-lumina-600">Login</Link></p>
      </div>
    </div>
  );
}
