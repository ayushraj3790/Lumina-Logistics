import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');

  useEffect(() => {
    adminAPI.getUsers({ role: role || undefined }).then((r) => setUsers(r.data.users));
  }, [role]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <select className="input-field max-w-xs" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">All roles</option>
        <option value="customer">Customer</option>
        <option value="driver">Driver</option>
        <option value="admin">Admin</option>
        <option value="warehouse">Warehouse</option>
      </select>
      <div className="grid gap-3">
        {users.map((u) => (
          <div key={u._id} className="card flex justify-between items-center">
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-slate-500">{u.email}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs bg-lumina-100 dark:bg-lumina-900 text-lumina-700 capitalize">{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
