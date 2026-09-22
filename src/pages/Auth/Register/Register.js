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

        if (userType === 'student') {
            const { firstName, lastName, email, password, confirmPassword } = studentData;
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                setError('Please fill in all fields.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                setLoading(false);
                return;
            }
            if (users.some(u => u.email === email)) {
                setError('An account with this email already exists.');
                setLoading(false);
                return;
            }
            setTimeout(() => {
                addUser({ name: `${firstName} ${lastName}`, email, password, role: 'student' });
                setLoading(false);
                setSuccess(true);
            }, 800);

        } else if (userType === 'employer') {
            const { companyName, companyEmail, contactName, password, confirmPassword } = employerData;
            if (!companyName || !companyEmail || !password || !confirmPassword) {
                setError('Please fill in all fields.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                setLoading(false);
                return;
            }
            const allEmails = [
                ...users.map(u => u.email),
                ...employers.map(e => e.email),
            ];
            if (allEmails.includes(companyEmail)) {
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

                    {error && <div className="error-message">{error}</div>}

                    <div className="user-type-selector">
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="user-type-dropdown"
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
                                            <input type="text" className="form-input" placeholder="First Name"
                                                value={studentData.firstName}
                                                onChange={(e) => handleStudentChange('firstName', e.target.value)}
                                                disabled={loading} />
                                        </div>
                                        <div className="form-group">
                                            <input type="text" className="form-input" placeholder="Last Name"
                                                value={studentData.lastName}
                                                onChange={(e) => handleStudentChange('lastName', e.target.value)}
                                                disabled={loading} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <input type="email" className="form-input" placeholder="Email Address"
                                            value={studentData.email}
                                            onChange={(e) => handleStudentChange('email', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Password"
                                            value={studentData.password}
                                            onChange={(e) => handleStudentChange('password', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Confirm Password"
                                            value={studentData.confirmPassword}
                                            onChange={(e) => handleStudentChange('confirmPassword', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                </>
                            )}

                            {userType === 'employer' && (
                                <>
                                    <div className="form-group">
                                        <input type="text" className="form-input" placeholder="Company Name"
                                            value={employerData.companyName}
                                            onChange={(e) => handleEmployerChange('companyName', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="text" className="form-input" placeholder="Contact Person Name"
                                            value={employerData.contactName}
                                            onChange={(e) => handleEmployerChange('contactName', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="email" className="form-input" placeholder="Company Email"
                                            value={employerData.companyEmail}
                                            onChange={(e) => handleEmployerChange('companyEmail', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Password"
                                            value={employerData.password}
                                            onChange={(e) => handleEmployerChange('password', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="Confirm Password"
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
