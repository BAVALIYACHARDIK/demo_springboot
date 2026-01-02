import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registeruser } from '../services/Authapi';

export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await registeruser({ name, email, password });
            if (response && response.message === 'Email already in use') {
                setStatus({ ok: false, error: response.message });
            } else {
                setStatus({ ok: true, data: response });
                setName('');
                setEmail('');
                setPassword('');
                // Optional: Redirect to dashboard after 1 second so they see the success message
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
            console.log('register response', response);

        } catch (err) {
            setStatus({ ok: false, error: err.message || err });
            console.error(err);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
            <h2>Register</h2>
            <div className="auth-redirect">
                <span>Already have an account?</span>
                <button type="button" className="link-btn" onClick={() => navigate('/auth/login')}>Go to Login</button>
            </div>
            <form className="auth-form" onSubmit={submit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">Register</button>
                </div>
            </form>

            {status === 'loading' && <p className="status-message">Registering…</p>}
            {status && status.ok && <p className="status-message success">Registered successfully</p>}
            {status && status.ok === false && <p className="status-message error">{status.error}</p>}
            </div>
        </div>
    );
}

export default Register;
