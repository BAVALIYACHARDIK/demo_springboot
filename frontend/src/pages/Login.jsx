import {useState} from "react";
import {useNavigate} from 'react-router-dom'
import {loginuser} from '../services/Authapi'

export function Login(){
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status,setStatus] = useState(null);
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await loginuser({ email, password });
                // backend returns an AuthResponse that includes a token and a message
                // success: token is present; failure: message contains error
                if (response && response.token) {
                    setEmail('');
                    setPassword('');
                    setStatus({ ok: true, data: response });
                    navigate('/dashboard');
                } else if (response && response.message) {
                    setStatus({ ok: false, error: response.message });
                } else {
                    setStatus({ ok: false, error: 'Login failed' });
                }
            console.log('login response', response);

        } catch (err) {
            setStatus({ ok: false, error: err.message || err });
            console.error(err);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
            <h2>Login</h2>
            <div className="auth-redirect">
                <span>Don't have an account?</span>
                <button type="button" className="link-btn" onClick={() => navigate('/auth/Register')}>Go to Register</button>
            </div>
            <form className="auth-form" onSubmit={submit}>
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
                    <button type="submit" className="btn-primary">Login</button>
                </div>
            </form>

            {status === 'loading' && <p className="status-message">Logging in…</p>}
            {status && status.ok && <p className="status-message success">Logged in successfully</p>}
            {status && status.ok === false && <p className="status-message error">{status.error}</p>}
            </div>
        </div>
    );
}