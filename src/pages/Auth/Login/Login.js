import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppData } from '../../../data/useAppData';
import './Login.css';

export default function Login({ navigateTo }) {
    const { users, employers } = useAppData();
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
        if (!emailRegex.test(email.trim())) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const foundUser = users.find(
            (user) => (user.email || '').toLowerCase() === normalizedEmail && user.password === password
        );

        if (!foundUser) {
            setError('Invalid email or password. Please try again.');
            setLoading(false);
            return;
        }

        if (foundUser.active === false) {
            setError('This account has been deactivated. Please contact an administrator.');
            setLoading(false);
            return;
        }

        if (foundUser.role === 'employer') {
            const employerRecord = (employers || []).find(
                (e) => (e.email || '').toLowerCase() === normalizedEmail
            );
            if (employerRecord?.status === 'pending') {
                setError('Your employer account is still pending admin approval.');
                setLoading(false);
                return;
            }
            if (employerRecord?.status === 'rejected') {
                setError('Your employer registration was not approved. Please contact an administrator.');
                setLoading(false);
                return;
            }
        }

        // Login successful
        const { password: _password, ...safeUser } = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        window.location.href = `/${foundUser.role}-dashboard`;
    };

    return (
        <div className="login-page" >
            <div className="login-container" >
                <div className="login-box" >

                    <div className="login-header" >
                        <h1>ProjectHub</h1>
                        <p>Welcome back! Please login to your account.</p>
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="email" autoComplete="email"
                                id="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example123@domain.com" aria-label="Email"
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
                                    placeholder="Please enter your password" aria-label="Password"
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