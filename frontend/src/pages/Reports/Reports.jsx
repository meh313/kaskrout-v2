import React, { useEffect, useMemo, useState } from 'react';
import { dailyApi, formatDate, parseApiError } from '../../api';

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const Reports = () => {
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState([]); // [{ date: Date, summary }]

  const weekStart = useMemo(() => getMonday(anchorDate), [anchorDate]);
  const weekDates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  const loadWeek = async () => {
    setLoading(true);
    setError('');
    try {
      const requests = weekDates.map((d) => dailyApi.getSummaryByDate(formatDate(d)).then((res) => ({ date: new Date(d), summary: res.data })).catch(() => ({ date: new Date(d), summary: null })));
      const results = await Promise.all(requests);
      setDays(results);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart.getTime()]);

  const goWeeks = (delta) => {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + delta * 7);
    setAnchorDate(d);
  };

  // Aggregations
  const totals = useMemo(() => {
    let totalCost = 0;
    let totalEarnings = 0;
    let totalNet = 0;
    let totalBaguettesUsed = 0;

    days.forEach((day) => {
      const s = day.summary;
      if (!s) return;
      const cost = s.summary?.totalConsumablesCost ?? 0;
      const earn = s.earnings?.totalEarnings ?? 0;
      const net = s.earnings?.netProfit ?? (earn - cost);
      totalCost += Number(cost);
      totalEarnings += Number(earn);
      totalNet += Number(net);
      totalBaguettesUsed += Number(s.baguettes?.usedCount ?? 0);
    });

    return { totalCost, totalEarnings, totalNet, totalBaguettesUsed };
  }, [days]);

  const consumableTotals = useMemo(() => {
    const map = new Map(); // name -> { used, cost }
    days.forEach((day) => {
      const s = day.summary;
      if (!s?.consumables) return;
      s.consumables.forEach((u) => {
        const name = u.consumable?.name || '—';
        const price = parseFloat(u.consumable?.price || 0);
        const used = Number(u.usedCount || 0);
        const prev = map.get(name) || { used: 0, cost: 0 };
        prev.used += used;
        prev.cost += used * price;
        map.set(name, prev);
      });
    });
    return Array.from(map.entries()).map(([name, val]) => ({ name, used: val.used, cost: val.cost }));
  }, [days]);

  const weekLabel = `${formatDate(weekStart)} → ${formatDate(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6))}`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">التقرير الأسبوعي</h1>
        <p className="page-subtitle">{weekLabel}</p>
        <div className="page-actions">
          <button className="btn-secondary" onClick={() => goWeeks(-1)}>الأسبوع السابق</button>
          <input
            type="date"
            value={formatDate(anchorDate)}
            onChange={(e) => setAnchorDate(new Date(e.target.value))}
            style={{ maxWidth: 180 }}
          />
          <button className="btn-secondary" onClick={() => goWeeks(1)}>الأسبوع التالي</button>
          <button className="btn-primary" onClick={() => setAnchorDate(new Date())}>هذا الأسبوع</button>
        </div>
      </div>

      {error && <div className="error-message mb-3">{error}</div>}
      {loading && <div className="loading" />}

      {/* Weekly totals */}
      <div className="stats-grid" style={{ opacity: loading ? 0.6 : 1 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <h4 className="stat-card-title">إجمالي تكلفة المستهلكات</h4>
            <div className="stat-card-icon">🧾</div>
          </div>
          <p className="stat-card-value">{totals.totalCost.toFixed(2)} د.ت</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <h4 className="stat-card-title">إجمالي المداخيل</h4>
            <div className="stat-card-icon">💰</div>
          </div>
          <p className="stat-card-value">{totals.totalEarnings.toFixed(2)} د.ت</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <h4 className="stat-card-title">إجمالي الربح الصافي</h4>
            <div className="stat-card-icon">📈</div>
          </div>
          <p className="stat-card-value">{totals.totalNet.toFixed(2)} د.ت</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <h4 className="stat-card-title">مجموع الباقات المستهلكة</h4>
            <div className="stat-card-icon">🥖</div>
          </div>
          <p className="stat-card-value">{totals.totalBaguettesUsed}</p>
        </div>
      </div>

      {/* Daily rows */}
      <div className="card mt-4">
        <div className="card-header"><h3>أيام الأسبوع</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>تكلفة المستهلكات</th>
                  <th>المداخيل</th>
                  <th>الربح الصافي</th>
                  <th>الباقات المستهلكة</th>
                </tr>
              </thead>
              <tbody>
                {weekDates.map((d) => {
                  const day = days.find((x) => formatDate(x.date) === formatDate(d));
                  const s = day?.summary;
                  const cost = s?.summary?.totalConsumablesCost ?? 0;
                  const earn = s?.earnings?.totalEarnings ?? 0;
                  const net = s?.earnings?.netProfit ?? (earn - cost);
                  const bag = s?.baguettes?.usedCount ?? 0;
                  return (
                    <tr key={formatDate(d)}>
                      <td>{formatDate(d)}</td>
                      <td>{Number(cost).toFixed(2)} د.ت</td>
                      <td>{Number(earn).toFixed(2)} د.ت</td>
                      <td>{Number(net).toFixed(2)} د.ت</td>
                      <td>{bag}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Aggregated consumables */}
      <div className="card mt-4">
        <div className="card-header"><h3>المستهلكات (مجموع أسبوعي)</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>المستهلك</th>
                  <th>المجموع المستهلك</th>
                  <th>إجمالي التكلفة</th>
                </tr>
              </thead>
              <tbody>
                {consumableTotals.length ? (
                  consumableTotals.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td>{c.used}</td>
                      <td>{c.cost.toFixed(2)} د.ت</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-secondary">لا توجد بيانات هذا الأسبوع</td>
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

export default Reports;