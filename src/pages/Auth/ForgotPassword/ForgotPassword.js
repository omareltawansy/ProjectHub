import React, { useState } from 'react';
import { useAppData } from '../../../data/useAppData';
import './ForgotPassword.css';

export default function ForgotPassword({ navigateTo }) {
    const { users, updateUser } = useAppData();
    const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email) {
            setError('Please enter your email.');
            setLoading(false);
            return;
        }

        const userExists = users.find((user) => (user.email || '').toLowerCase() === email.trim().toLowerCase());

        if (!userExists) {
            setError('Email not found in our system.');
            setLoading(false);
            return;
        }

        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(randomOtp);

        setLoading(false);
        setStep(2);
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!otp) {
            setError('Please enter the OTP.');
            setLoading(false);
            return;
        }

        if (otp !== generatedOtp) {
            setError('Invalid OTP. Please try again.');
            setLoading(false);
            return;
        }

        setLoading(false);
        setStep(3);
    };

    const handlePasswordReset = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        const userToUpdate = users.find((user) => (user.email || '').toLowerCase() === email.trim().toLowerCase());
        if (userToUpdate) {
            updateUser(userToUpdate.id, { password: newPassword });
        }

        setLoading(false);
        navigateTo('login');
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                <div className="forgot-password-box">

                    <div className="forgot-password-header">
                        <h1>ProjectHub</h1>
                        <p>Reset your password</p>
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit}>
                            <p className="step-label">Enter your email</p>

                            <div className="form-group">
                                <input
                                    type="email" autoComplete="email"
                                    className="form-input"
                                    placeholder="example123@domain.com" aria-label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleOtpSubmit}>
                            <p className="step-label">Enter the OTP sent to your email</p>
                            {/* No email service in this prototype — surface the code in the UI instead of the console. */}
                            <p className="step-label" style={{ opacity: 0.75, fontSize: 13 }}>
                                Demo mode: your code is <strong>{generatedOtp}</strong>
                            </p>

                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter 6-digit OTP" aria-label="One-time code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                    disabled={loading}
                                />
                            </div>

                            <div className="button-group">
                              <button
                                  type="submit"
                                  className="submit-button"
                                  disabled={loading}
                              >
                                  {loading ? 'Verifying...' : 'Verify OTP'}
                              </button>

                              <button
                                  type="button"
                                  className="back-button"
                                  onClick={() => {
                                      setStep(1);
                                      setOtp('');
                                      setError('');
                                  }}
                              >
                                  Back
                              </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handlePasswordReset}>
                            <p className="step-label">Set your new password</p>

                            <div className="form-group">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="New Password" aria-label="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Confirm Password" aria-label="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="button-group">
                              <button
                                  type="submit"
                                  className="submit-button"
                                  disabled={loading}
                              >
                                  {loading ? 'Resetting...' : 'Reset Password'}
                              </button>

                              <button
                                  type="button"
                                  className="back-button"
                                  onClick={() => {
                                      setStep(2);
                                      setNewPassword('');
                                      setConfirmPassword('');
                                      setError('');
                                  }}
                              >
                                  Back
                              </button>
                            </div>
                        </form>
                    )}

                    <p className="login-prompt">
                        Remember your password?{' '}
                        <button type="button" onClick={() => navigateTo('login')}>
                          Login here
                        </button>
                    </p>

                </div>
            </div>
        </div>
    );
}