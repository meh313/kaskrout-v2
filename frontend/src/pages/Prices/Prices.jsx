import React, { useEffect, useState } from 'react';
import { consumablesApi, productsApi, parseApiError } from '../../api';
import { useAuth } from '../../auth/AuthContext';

const Prices = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'vip' || user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Consumables
  const [consumables, setConsumables] = useState([]);
  const [newConsumable, setNewConsumable] = useState({ name: '', price: '' });

  // Products
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '' });

  const loadAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [cRes, pRes] = await Promise.all([
        consumablesApi.getAll(),
        productsApi.getAll(),
      ]);
      setConsumables(cRes.data || []);
      setProducts(pRes.data || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // =========================
  // Consumables handlers
  // =========================
  const addConsumable = async () => {
    if (!isManager) return;
    setError(''); setSuccess('');
    const { name, price } = newConsumable;
    if (!name || !price) return setError('الاسم والسعر مطلوبان');
    try {
      await consumablesApi.create({ name: name.trim(), price: Number(price) });
      setNewConsumable({ name: '', price: '' });
      setSuccess('تمت إضافة المستهلك');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const updateConsumable = async (c) => {
    if (!isManager) return;
    setError(''); setSuccess('');
    try {
      await consumablesApi.update(c.id, { name: c.name, price: Number(c.price) });
      setSuccess('تم حفظ التعديلات');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const deleteConsumable = async (id) => {
    if (!isManager) return;
    if (!confirm('هل تريد حذف هذا المستهلك؟')) return;
    setError(''); setSuccess('');
    try {
      await consumablesApi.delete(id);
      setSuccess('تم الحذف');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  // =========================
  // Products handlers
  // =========================
  const addProduct = async () => {
    if (!isManager) return;
    setError(''); setSuccess('');
    const { name, category, price } = newProduct;
    if (!name || !price) return setError('الاسم والسعر مطلوبان');
    try {
      await productsApi.create({ name: name.trim(), category: (category || '').trim(), price: Number(price) });
      setNewProduct({ name: '', category: '', price: '' });
      setSuccess('تمت إضافة المنتج');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const updateProduct = async (p) => {
    if (!isManager) return;
    setError(''); setSuccess('');
    try {
      await productsApi.update(p.id, { name: p.name, category: p.category || '', price: Number(p.price) });
      setSuccess('تم حفظ التعديلات');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const deleteProduct = async (id) => {
    if (!isManager) return;
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    setError(''); setSuccess('');
    try {
      await productsApi.delete(id);
      setSuccess('تم الحذف');
      await loadAll();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  // Inline editing handlers
  const setConsumableField = (id, field, value) => {
    setConsumables(consumables.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };
  const setProductField = (id, field, value) => {
    setProducts(products.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">الأسعار</h1>
        <p className="page-subtitle">إدارة أسعار المستهلكات والمنتجات</p>
      </div>

      {error && <div className="error-message mb-3">{error}</div>}
      {success && <div className="success-message mb-3">{success}</div>}
      {loading && <div className="loading" />}

      <div className="grid grid-cols-2" style={{ opacity: loading ? 0.6 : 1 }}>
        {/* Consumables table */}
        <div className="card">
          <div className="card-header"><h3>المستهلكات</h3></div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>الاسم</th>
                    <th style={{ width: '25%' }}>السعر (د.ت)</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add row */}
                  <tr>
                    <td>
                      <input
                        type="text"
                        value={newConsumable.name}
                        onChange={(e) => setNewConsumable({ ...newConsumable, name: e.target.value })}
                        placeholder="اسم المستهلك"
                        disabled={!isManager}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={newConsumable.price}
                        onChange={(e) => setNewConsumable({ ...newConsumable, price: e.target.value })}
                        placeholder="0.00"
                        disabled={!isManager}
                      />
                    </td>
                    <td>
                      <button className="btn-success btn-sm" onClick={addConsumable} disabled={!isManager}>إضافة</button>
                    </td>
                  </tr>

                  {/* Existing rows */}
                  {consumables.length ? (
                    consumables.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => setConsumableField(c.id, 'name', e.target.value)}
                            disabled={!isManager}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={c.price}
                            onChange={(e) => setConsumableField(c.id, 'price', e.target.value)}
                            disabled={!isManager}
                          />
                        </td>
                        <td className="flex gap-2">
                          <button className="btn-primary btn-sm" onClick={() => updateConsumable(c)} disabled={!isManager}>حفظ</button>
                          <button className="btn-danger btn-sm" onClick={() => deleteConsumable(c.id)} disabled={!isManager}>حذف</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-secondary">لا توجد مستهلكات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Products table */}
        <div className="card">
          <div className="card-header"><h3>المنتجات</h3></div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>الاسم</th>
                    <th style={{ width: '25%' }}>الفئة</th>
                    <th style={{ width: '20%' }}>السعر (د.ت)</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add row */}
                  <tr>
                    <td>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="اسم المنتج"
                        disabled={!isManager}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        placeholder="الفئة (مثال: كسكروت/إضافة)"
                        disabled={!isManager}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                        disabled={!isManager}
                      />
                    </td>
                    <td>
                      <button className="btn-success btn-sm" onClick={addProduct} disabled={!isManager}>إضافة</button>
                    </td>
                  </tr>

                  {/* Existing rows */}
                  {products.length ? (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => setProductField(p.id, 'name', e.target.value)}
                            disabled={!isManager}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={p.category || ''}
                            onChange={(e) => setProductField(p.id, 'category', e.target.value)}
                            disabled={!isManager}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={p.price}
                            onChange={(e) => setProductField(p.id, 'price', e.target.value)}
                            disabled={!isManager}
                          />
                        </td>
                        <td className="flex gap-2">
                          <button className="btn-primary btn-sm" onClick={() => updateProduct(p)} disabled={!isManager}>حفظ</button>
                          <button className="btn-danger btn-sm" onClick={() => deleteProduct(p.id)} disabled={!isManager}>حذف</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-secondary">لا توجد منتجات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices;