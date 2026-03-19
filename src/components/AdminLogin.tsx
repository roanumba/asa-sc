import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/AuthService';

export const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.login(username, password);

            if (result.success && result.step === 'otp') {
                setStep('otp');
            } else if (!result.success) {
                setError(result.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.verifyOtp(otp);

            if (result.success) {
                history.push('/admin/dashboard');
            } else {
                setError(result.error || 'Invalid verification code');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h3 className="card-title text-center mb-4">Admin Login</h3>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {step === 'credentials' ? (
                                <form onSubmit={handleCredentialsSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            autoFocus
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Verifying...
                                            </>
                                        ) : 'Continue'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-link w-100 mt-2"
                                        onClick={() => history.push('/applicant/login')}
                                        disabled={loading}
                                    >
                                        Back
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleOtpSubmit}>
                                    <div className="alert alert-info" role="alert">
                                        A 6-digit verification code has been sent to the admin email.
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="otp" className="form-label">Verification Code</label>
                                        <input
                                            type="text"
                                            className="form-control text-center"
                                            id="otp"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                            autoFocus
                                            disabled={loading}
                                            style={{ letterSpacing: '0.3em', fontSize: '1.4rem' }}
                                        />
                                        <div className="form-text">Code expires in 5 minutes.</div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading || otp.length !== 6}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Verifying...
                                            </>
                                        ) : 'Verify & Login'}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-link w-100 mt-2"
                                        onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                                        disabled={loading}
                                    >
                                        Back to login
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
