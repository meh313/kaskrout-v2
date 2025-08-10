import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/client';
import { parseApiError } from '../../api';

const Users = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'vip' || user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', password: '', role: 'user' });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(''); setSuccess('');
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const addUser = async () => {
    if (!isManager) return;
    setError(''); setSuccess('');
    const { name, password, role } = newUser;
    if (!name || !password) return setError('الاسم وكلمة المرور مطلوبان');
    try {
      await api.post('/users', { name, password, role });
      setNewUser({ name: '', password: '', role: 'user' });
      setSuccess('تمت إضافة المستخدم');
      await loadUsers();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const updateUser = async (u) => {
    if (!isManager) return;
    setError(''); setSuccess('');
    setSavingId(u.id);
    try {
      const payload = { name: u.name, role: u.role };
      if (u.newPassword) payload.newPassword = u.newPassword;
      await api.put(`/users/${u.id}`, payload);
      setSuccess('تم حفظ التعديلات');
      await loadUsers();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (id) => {
    if (!isManager) return;
    if (!confirm('هل تريد حذف هذا المستخدم؟')) return;
    setError(''); setSuccess('');
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      setSuccess('تم الحذف');
      await loadUsers();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const setUserField = (id, field, value) => {
    setUsers(users.map((u) => u.id === id ? { ...u, [field]: value } : u));
  };

  if (!isManager) {
    return <div className="error-message">غير مصرح لك بعرض هذه الصفحة</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">المستخدمون</h1>
        <p className="page-subtitle">إدارة حسابات النظام</p>
      </div>

      {error && <div className="error-message mb-3">{error}</div>}
      {success && <div className="success-message mb-3">{success}</div>}
      {loading && <div className="loading" />}

      <div className="card" style={{ opacity: loading ? 0.6 : 1 }}>
        <div className="card-header"><h3>إدارة المستخدمين</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>الاسم</th>
                  <th style={{ width: '20%' }}>الدور</th>
                  <th style={{ width: '25%' }}>كلمة مرور جديدة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {/* Add row */}
                <tr>
                  <td>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="اسم المستخدم"
                    />
                  </td>
                  <td>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                      <option value="user">user</option>
                      <option value="vip">vip</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="كلمة المرور"
                    />
                  </td>
                  <td>
                    <button className="btn-success btn-sm" onClick={addUser}>إضافة</button>
                  </td>
                </tr>

                {/* Existing rows */}
                {users.length ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <input
                          type="text"
                          value={u.name}
                          onChange={(e) => setUserField(u.id, 'name', e.target.value)}
                          disabled={savingId === u.id}
                        />
                      </td>
                      <td>
                        <select value={u.role} onChange={(e) => setUserField(u.id, 'role', e.target.value)} disabled={savingId === u.id}>
                          <option value="user">user</option>
                          <option value="vip">vip</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="password"
                          placeholder="اتركه فارغاً إذا لا تغيير"
                          value={u.newPassword || ''}
                          onChange={(e) => setUserField(u.id, 'newPassword', e.target.value)}
                          disabled={savingId === u.id}
                        />
                      </td>
                      <td className="flex gap-2">
                        <button className="btn-primary btn-sm" onClick={() => updateUser(u)} disabled={savingId === u.id}>
                          {savingId === u.id ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => deleteUser(u.id)} disabled={deletingId === u.id}>
                          {deletingId === u.id ? 'جاري الحذف...' : 'حذف'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-secondary">لا توجد حسابات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
