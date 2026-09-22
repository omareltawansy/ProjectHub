import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppData } from '../../../data/useAppData';
import './Login.css';

export default function Login({ navigateTo }) {
    const { users } = useAppData();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email && !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        } else if (!email) {
            setError('Please enter your email.');
            setLoading(false);
            return;
        } else if (!password) {
            setError('Please enter your password.');
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }
        setTimeout(() => {
            const foundUser = users.find(
                (user) => user.email === email && user.password === password
            );

            if (!foundUser) {
                setError('Invalid email or password. Please try again.');
                setLoading(false);
                return;
            }

            // Login successful
            const { password: _password, ...safeUser } = foundUser;
            localStorage.setItem('currentUser', JSON.stringify(safeUser));
            window.location.href = `/${foundUser.role}-dashboard`;
        }, 1500);
    };

    return (
        <div className="login-page" >
            <div className="login-container" >
                <div className="login-box" >

                    <div className="login-header" >
                        <h1>ProjectHub</h1>
                        <p>Welcome back! Please login to your account.</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example123@domain.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <div className="password-field">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Please enter your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigateTo('forgot-password')}
                              className="forgot-password-link"
                            >
                              Forgot Password?
                            </button>
                        </div>

                        <div className="button-group">
                          <button
                              type="submit"
                              className="login-button"
                              disabled={loading}
                          >
                              {loading ? 'Logging in...' : 'Login'}
                          </button>

                          <button
                              type="button"
                              className="register-button"
                              onClick={() => navigateTo('register')}
                          >
                              Register
                          </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}