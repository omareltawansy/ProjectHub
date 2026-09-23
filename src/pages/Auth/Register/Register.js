import React, { useState } from 'react';
import { useAppData } from '../../../data/useAppData';
import './Register.css';

export default function Register({ navigateTo }) {
    const { users, addUser, employers, addEmployer } = useAppData();

    const [userType, setUserType] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState(false);

    const [studentData, setStudentData] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    });

    const [employerData, setEmployerData] = useState({
        companyName: '', companyEmail: '', contactName: '', password: '', confirmPassword: '',
    });

    const handleStudentChange = (field, value) =>
        setStudentData(prev => ({ ...prev, [field]: value }));

    const handleEmployerChange = (field, value) =>
        setEmployerData(prev => ({ ...prev, [field]: value }));

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailTaken = (addr) => [
            ...users.map(u => u.email),
            ...employers.map(e => e.email),
        ].some(existing => (existing || '').toLowerCase() === addr);

        if (userType === 'student') {
            const { firstName, lastName, password, confirmPassword } = studentData;
            const email = studentData.email.trim().toLowerCase();
            if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
                setError('Please fill in all fields.');
                setLoading(false);
                return;
            }
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address.');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                setLoading(false);
                return;
            }
            if (emailTaken(email)) {
                setError('An account with this email already exists.');
                setLoading(false);
                return;
            }
            setTimeout(() => {
                addUser({ name: `${firstName.trim()} ${lastName.trim()}`, email, password, role: 'student' });
                setLoading(false);
                setSuccess(true);
            }, 800);

        } else if (userType === 'employer') {
            const { contactName, password, confirmPassword } = employerData;
            const companyName = employerData.companyName.trim();
            const companyEmail = employerData.companyEmail.trim().toLowerCase();
            if (!companyName || !companyEmail || !password || !confirmPassword) {
                setError('Please fill in all required fields.');
                setLoading(false);
                return;
            }
            if (!emailRegex.test(companyEmail)) {
                setError('Please enter a valid email address.');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                setLoading(false);
                return;
            }
            if (emailTaken(companyEmail)) {
                setError('An account with this email already exists.');
                setLoading(false);
                return;
            }
            setTimeout(() => {
                // Add to users so they can log in
                addUser({
                    name: contactName || companyName,
                    email: companyEmail,
                    password,
                    role: 'employer',
                    companyName,
                });
                // Also add to employers list (pending review)
                addEmployer({
                    companyName,
                    contactName: contactName || companyName,
                    email: companyEmail,
                    industry: '',
                    address: '',
                    phone: '',
                    website: '',
                    bio: '',
                    status: 'pending',
                    flagged: false,
                    taxDocs: [],
                });
                setLoading(false);
                setSuccess(true);
            }, 800);
        } else {
            setError('Please select an account type.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="register-page">
                <div className="register-container">
                    <div className="register-box">
                        <div className="register-header">
                            <h1>ProjectHub</h1>
                            <p style={{ color: 'var(--success, #4caf82)', fontWeight: 600 }}>
                                Account created successfully!
                            </p>
                        </div>
                        {userType === 'employer' && (
                            <p style={{ fontSize: 13, textAlign: 'center', marginBottom: 16, opacity: 0.75 }}>
                                Your employer account is pending admin approval. You can log in once it's approved.
                            </p>
                        )}
                        <button className="register-button" onClick={() => navigateTo('login')}>
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-box">

                    <div className="register-header">
                        <h1>ProjectHub</h1>
                        <p>Create your account</p>
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <div className="user-type-selector">
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="user-type-dropdown"
                            aria-label="Account type"
                            disabled={loading}
                        >
                            {!userType && <option value="">Select account type</option>}
                            <option value="student">Student</option>
                            <option value="employer">Employer</option>
                        </select>
                    </div>

                    {userType && (
                        <form onSubmit={handleRegister}>
                            {userType === 'student' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <input type="text" className="form-input" placeholder="First Name" aria-label="First name"
                                                value={studentData.firstName}
                                                onChange={(e) => handleStudentChange('firstName', e.target.value)}
                                                disabled={loading} />
                                        </div>
                                        <div className="form-group">
                                            <input type="text" className="form-input" placeholder="Last Name" aria-label="Last name"
                                                value={studentData.lastName}
                                                onChange={(e) => handleStudentChange('lastName', e.target.value)}
                                                disabled={loading} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <input type="email" autoComplete="email" className="form-input" placeholder="Email Address" aria-label="Email address"
                                            value={studentData.email}
                                            onChange={(e) => handleStudentChange('email', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Password (min. 6 characters)" aria-label="Password"
                                            value={studentData.password}
                                            onChange={(e) => handleStudentChange('password', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Confirm Password" aria-label="Confirm password"
                                            value={studentData.confirmPassword}
                                            onChange={(e) => handleStudentChange('confirmPassword', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                </>
                            )}

                            {userType === 'employer' && (
                                <>
                                    <div className="form-group">
                                        <input type="text" className="form-input" placeholder="Company Name" aria-label="Company name"
                                            value={employerData.companyName}
                                            onChange={(e) => handleEmployerChange('companyName', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="text" className="form-input" placeholder="Contact Person Name (optional)" aria-label="Contact person name"
                                            value={employerData.contactName}
                                            onChange={(e) => handleEmployerChange('contactName', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="email" autoComplete="email" className="form-input" placeholder="Company Email" aria-label="Company email"
                                            value={employerData.companyEmail}
                                            onChange={(e) => handleEmployerChange('companyEmail', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Password (min. 6 characters)" aria-label="Password"
                                            value={employerData.password}
                                            onChange={(e) => handleEmployerChange('password', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Confirm Password" aria-label="Confirm password"
                                            value={employerData.confirmPassword}
                                            onChange={(e) => handleEmployerChange('confirmPassword', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                </>
                            )}

                            <button type="submit" className="register-button" disabled={loading}>
                                {loading ? 'Creating account…' : 'Register'}
                            </button>
                        </form>
                    )}

                    <p className="login-prompt">
                        Already have an account?{' '}
                        <button type="button" onClick={() => navigateTo('login')}>Login here</button>
                    </p>

                </div>
            </div>
        </div>
    );
}
