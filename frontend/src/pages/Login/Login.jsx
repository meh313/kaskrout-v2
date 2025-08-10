import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="main-content" style={{ marginRight: 0 }}>
      <div className="main-content-inner" style={{ maxWidth: 420 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="page-title" style={{ marginBottom: 0 }}>كسكروت عم الحبيب</h2>
            <p className="page-subtitle">تسجيل الدخول إلى النظام</p>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">اسم المستخدم</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">كلمة المرور</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
                  >
                    {showPassword ? 'إخفاء' : 'عرض'}
                  </button>
                </div>
              </div>

              {error && <div className="error-message mb-3">{error}</div>}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>
          <div className="card-footer text-center">
            <p className="text-secondary" style={{ margin: 0 }}>نظام إدارة المطعم</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;