import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { dailyApi, formatDate, parseApiError } from '../../api';

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const dateStr = formatDate(selectedDate);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await dailyApi.getSummaryByDate(dateStr);
        setSummary(data);
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateStr]);

  const goDays = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  const totalCost = summary?.summary?.totalConsumablesCost ?? 0;
  const totalEarnings = summary?.earnings?.totalEarnings ?? 0;
  const netProfit = summary?.earnings?.netProfit ?? (totalEarnings - totalCost);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">مرحباً، {user?.name}</h1>
        <p className="page-subtitle">لوحة المعلومات اليومية</p>
        <div className="page-actions">
          <button className="btn-secondary" onClick={() => goDays(-1)}>اليوم السابق</button>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            style={{ maxWidth: 180 }}
          />
          <button className="btn-secondary" onClick={() => goDays(1)}>اليوم التالي</button>
          <button className="btn-primary" onClick={() => setSelectedDate(new Date())}>اليوم</button>
        </div>
      </div>

      {error && <div className="error-message mb-3">{error}</div>}
      {loading && <div className="loading" />}

      <div className="stats-grid" style={{ opacity: loading ? 0.6 : 1 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <h4 className="stat-card-title">تكلفة المستهلكات اليوم</h4>
            <div className="stat-card-icon">🧾</div>
          </div>
          <p className="stat-card-value">{Number(totalCost).toFixed(2)} د.ت</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h4 className="stat-card-title">مداخيل اليوم</h4>
            <div className="stat-card-icon">💰</div>
          </div>
          <p className="stat-card-value">{Number(totalEarnings).toFixed(2)} د.ت</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h4 className="stat-card-title">الصافي</h4>
            <div className="stat-card-icon">📈</div>
          </div>
          <p className="stat-card-value">{Number(netProfit).toFixed(2)} د.ت</p>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-4" style={{ opacity: loading ? 0.6 : 1 }}>
        <div className="card">
          <div className="card-header">
            <h3>المستهلكات اليوم</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>المستهلك</th>
                    <th>البداية</th>
                    <th>النهاية</th>
                    <th>المستهلك</th>
                    <th>التكلفة</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.consumables?.length ? (
                    summary.consumables.map((u) => {
                      const price = parseFloat(u.consumable.price);
                      const cost = u.usedCount * price;
                      return (
                        <tr key={u.id}>
                          <td>{u.consumable.name}</td>
                          <td>{u.startCount}</td>
                          <td>{u.endCount}</td>
                          <td>{u.usedCount}</td>
                          <td>{cost.toFixed(2)} د.ت</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-secondary">لا توجد بيانات لهذا التاريخ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>الخبز</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>البداية</th>
                    <th>النهاية</th>
                    <th>المستهلك</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{summary?.baguettes?.startCount ?? 0}</td>
                    <td>{summary?.baguettes?.endCount ?? 0}</td>
                    <td>{summary?.baguettes?.usedCount ?? 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;