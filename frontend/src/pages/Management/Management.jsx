import React, { useEffect, useMemo, useState } from 'react';
import { dailyApi, consumablesApi, formatDate, parseApiError } from '../../api';

const Management = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Disable-state flags
  const [savingEarnings, setSavingEarnings] = useState(false);
  const [savingBaguettes, setSavingBaguettes] = useState(false);
  const [addingUsage, setAddingUsage] = useState(false);
  const [savingUsageId, setSavingUsageId] = useState(null);
  const [deletingUsageId, setDeletingUsageId] = useState(null);

  // Auto-clear inline toasts
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 2500);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Earnings
  const [totalEarnings, setTotalEarnings] = useState('');
  const [notes, setNotes] = useState('');

  // Baguettes
  const [bagStart, setBagStart] = useState('');
  const [bagEnd, setBagEnd] = useState('');

  // Consumables
  const [allConsumables, setAllConsumables] = useState([]);
  const [usages, setUsages] = useState([]);
  const [newUsage, setNewUsage] = useState({ consumableId: '', startCount: '', endCount: '' });

  const dateStr = formatDate(selectedDate);

  const availableConsumablesForAdd = useMemo(() => {
    const usedIds = new Set(usages.map((u) => u.consumableId));
    return allConsumables.filter((c) => !usedIds.has(c.id));
  }, [allConsumables, usages]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [consumablesRes, usagesRes, bagRes, earnRes] = await Promise.all([
        consumablesApi.getAll(),
        dailyApi.getConsumablesByDate(dateStr),
        dailyApi.getBaguettesByDate(dateStr),
        dailyApi.getEarningsByDate(dateStr),
      ]);
      setAllConsumables(consumablesRes.data || []);
      setUsages(usagesRes.data || []);

      // Baguettes
      setBagStart((bagRes.data?.startCount ?? 0).toString());
      setBagEnd((bagRes.data?.endCount ?? 0).toString());

      // Earnings
      setTotalEarnings((earnRes.data?.totalEarnings ?? 0).toString());
      setNotes(earnRes.data?.notes ?? '');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  const goDays = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  const handleSaveEarnings = async () => {
    setError('');
    setSuccess('');
    setSavingEarnings(true);
    try {
      await dailyApi.saveEarnings({
        recordDate: dateStr,
        totalEarnings: Number(totalEarnings) || 0,
        notes,
      });
      setSuccess('تم حفظ المداخيل بنجاح');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSavingEarnings(false);
    }
  };

  const handleSaveBaguettes = async () => {
    setError('');
    setSuccess('');
    setSavingBaguettes(true);
    try {
      await dailyApi.saveBaguettes({
        recordDate: dateStr,
        startCount: parseInt(bagStart || '0', 10),
        endCount: parseInt(bagEnd || '0', 10),
      });
      setSuccess('تم حفظ بيانات الخبز بنجاح');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSavingBaguettes(false);
    }
  };

  const handleAddUsage = async () => {
    setError('');
    setSuccess('');
    const { consumableId, startCount, endCount } = newUsage;
    if (!consumableId) return setError('الرجاء اختيار مستهلك');
    setAddingUsage(true);
    try {
      await dailyApi.upsertConsumableUsage({
        recordDate: dateStr,
        consumableId: Number(consumableId),
        startCount: parseInt(startCount || '0', 10),
        endCount: parseInt(endCount || '0', 10),
      });
      setNewUsage({ consumableId: '', startCount: '', endCount: '' });
      setSuccess('تمت إضافة المستهلك');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setAddingUsage(false);
    }
  };

  const handleUpdateUsage = async (u) => {
    setError('');
    setSuccess('');
    setSavingUsageId(u.id);
    try {
      await dailyApi.updateConsumableUsage(u.id, {
        startCount: parseInt(u.startCount || 0, 10),
        endCount: parseInt(u.endCount || 0, 10),
      });
      setSuccess('تم حفظ التعديلات');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSavingUsageId(null);
    }
  };

  const handleDeleteUsage = async (id) => {
    setError('');
    setSuccess('');
    setDeletingUsageId(id);
    try {
      await dailyApi.deleteConsumableUsage(id);
      setSuccess('تم الحذف');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingUsageId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">الإدارة</h1>
        <p className="page-subtitle">إدخال وتعديل بيانات اليوم</p>
        <div className="page-actions">
          <button className="btn-secondary" onClick={() => goDays(-1)} disabled={loading}>اليوم السابق</button>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            style={{ maxWidth: 180 }}
            disabled={loading}
          />
          <button className="btn-secondary" onClick={() => goDays(1)} disabled={loading}>اليوم التالي</button>
          <button className="btn-primary" onClick={() => setSelectedDate(new Date())} disabled={loading}>اليوم</button>
        </div>
      </div>

      {error && <div className="error-message mb-3">{error}</div>}
      {success && <div className="success-message mb-3">{success}</div>}

      <div className="grid grid-cols-2" style={{ opacity: loading ? 0.6 : 1 }}>
        {/* Earnings */}
        <div className="card">
          <div className="card-header"><h3>المداخيل</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label>مجموع مداخيل اليوم (د.ت)</label>
              <input
                type="number"
                step="0.01"
                value={totalEarnings}
                onChange={(e) => setTotalEarnings(e.target.value)}
                disabled={savingEarnings || loading}
              />
            </div>
            <div className="form-group">
              <label>ملاحظات</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={savingEarnings || loading} />
            </div>
            <button className="btn-primary" onClick={handleSaveEarnings} disabled={savingEarnings || loading}>
              {savingEarnings ? 'جاري الحفظ...' : 'حفظ المداخيل'}
            </button>
          </div>
        </div>

        {/* Baguettes */}
        <div className="card">
          <div className="card-header"><h3>الخبز (الباقات)</h3></div>
          <div className="card-body">
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label>البداية</label>
                <input type="number" value={bagStart} onChange={(e) => setBagStart(e.target.value)} disabled={savingBaguettes || loading} />
              </div>
              <div className="form-group">
                <label>النهاية</label>
                <input type="number" value={bagEnd} onChange={(e) => setBagEnd(e.target.value)} disabled={savingBaguettes || loading} />
              </div>
            </div>
            <button className="btn-primary" onClick={handleSaveBaguettes} disabled={savingBaguettes || loading}>
              {savingBaguettes ? 'جاري الحفظ...' : 'حفظ الخبز'}
            </button>
          </div>
        </div>
      </div>

      {/* Consumables Usage */}
      <div className="card mt-4" style={{ opacity: loading ? 0.6 : 1 }}>
        <div className="card-header"><h3>المستهلكات</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>المستهلك</th>
                  <th>البداية</th>
                  <th>النهاية</th>
                  <th>المستهلك</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {/* New row */}
                <tr>
                  <td>
                    <select
                      value={newUsage.consumableId}
                      onChange={(e) => setNewUsage({ ...newUsage, consumableId: e.target.value })}
                      disabled={addingUsage || loading}
                    >
                      <option value="">اختر مستهلك</option>
                      {availableConsumablesForAdd.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={newUsage.startCount}
                      onChange={(e) => setNewUsage({ ...newUsage, startCount: e.target.value })}
                      disabled={addingUsage || loading}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={newUsage.endCount}
                      onChange={(e) => setNewUsage({ ...newUsage, endCount: e.target.value })}
                      disabled={addingUsage || loading}
                    />
                  </td>
                  <td className="text-secondary">—</td>
                  <td>
                    <button className="btn-success btn-sm" onClick={handleAddUsage} disabled={addingUsage || loading || !newUsage.consumableId}>
                      {addingUsage ? 'جاري الإضافة...' : 'إضافة'}
                    </button>
                  </td>
                </tr>

                {/* Existing rows */}
                {usages.length ? (
                  usages.map((u) => (
                    <tr key={u.id}>
                      <td>{u.consumable?.name || '—'}</td>
                      <td>
                        <input
                          type="number"
                          value={u.startCount}
                          onChange={(e) => setUsages(usages.map((x) => x.id === u.id ? { ...x, startCount: e.target.value } : x))}
                          disabled={savingUsageId === u.id || loading}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={u.endCount}
                          onChange={(e) => setUsages(usages.map((x) => x.id === u.id ? { ...x, endCount: e.target.value } : x))}
                          disabled={savingUsageId === u.id || loading}
                        />
                      </td>
                      <td>{Math.max(0, parseInt(u.startCount || 0, 10) - parseInt(u.endCount || 0, 10))}</td>
                      <td className="flex gap-2">
                        <button className="btn-primary btn-sm" onClick={() => handleUpdateUsage(u)} disabled={savingUsageId === u.id || loading}>
                          {savingUsageId === u.id ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => handleDeleteUsage(u.id)} disabled={deletingUsageId === u.id || loading}>
                          {deletingUsageId === u.id ? 'جاري الحذف...' : 'حذف'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary">لا توجد سجلات</td>
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

export default Management;