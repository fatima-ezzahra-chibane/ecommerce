import { useEffect, useState } from 'react';
import { adminService } from '../../services';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const load = () => adminService.users().then(({ data }) => setUsers(data.data || []));

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await adminService.toggleUser(id);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Utilisateurs</h1>
      <div className="table-responsive">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden min-w-[560px]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Rôle</th>
              <th className="text-left p-3">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{u.role}</span></td>
                <td className="p-3">{u.is_active ? '✅ Actif' : '❌ Inactif'}</td>
                <td className="p-3 text-right">
                  {u.role !== 'admin' && (
                    <button onClick={() => toggle(u.id)} className="text-sm text-[#ff4d8d]">
                      {u.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
