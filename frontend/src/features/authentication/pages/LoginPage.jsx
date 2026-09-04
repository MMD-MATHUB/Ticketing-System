import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../../../store/authSlice';
import './LoginPage.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, applications } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(applications.length > 1 ? '/choose-app' : '/dashboard')
    }
  }, [applications, isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(loginUser({ email, password }));
    if (result.payload && result.payload.success) {
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Service Operations</h1>
          <p>Sign in to access your applications</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            Requester only: <code>demo@example.com</code><br />
            Password: <code>password123</code>
            <br /><br />
            Multi-app: <code>admin@example.com</code><br />
            Password: <code>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
