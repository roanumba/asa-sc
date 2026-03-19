import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { fetchWithoutToken } from '../services/ServerService';
import { store } from '../';

type Step = 'email' | 'name';

export const NewFormGate: React.FC = () => {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.lookupApplicant(email);

            if (!result.success) {
                setError(result.error || 'An error occurred');
                return;
            }

            if (result.redirect === 'admin') {
                history.push('/admin/login');
                return;
            }

            if (result.found) {
                // Already has a form — send to login/continue
                store.prefillEmail = email;
                history.push('/applicant/login');
                return;
            }

            // New user — ask for name
            setStep('name');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetchWithoutToken('/applications/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, firstName, lastName }),
            });

            if (response && response.success) {
                const { formNumber, firstName: fn, lastName: ln } = response.data;
                // Pre-load store so FormView is pre-filled
                store.formNo = formNumber;
                store.formData = { email, firstName: fn, lastName: ln, formNumber } as any;
                history.push('/formViewPage');
            } else if (response?.status === 409 || (response?.error && response.error.includes('already exists'))) {
                // Race condition — duplicate found
                store.prefillEmail = email;
                history.push('/applicant/login');
            } else {
                setError(response?.error || 'Failed to create application. Please try again.');
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
                            <h3 className="card-title text-center mb-1">Start a New Form</h3>
                            <p className="text-center text-muted mb-4" style={{ fontSize: 14 }}>
                                {store.year} Scholarship
                            </p>

                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            {step === 'email' && (
                                <form onSubmit={handleEmailSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            autoFocus
                                            disabled={loading}
                                        />
                                        <div className="form-text">We'll send your form number to this address.</div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Checking...</>
                                        ) : 'Continue'}
                                    </button>
                                    <button type="button" className="btn btn-link w-100 mt-2" onClick={() => history.push('/')} disabled={loading}>
                                        Back
                                    </button>
                                </form>
                            )}

                            {step === 'name' && (
                                <form onSubmit={handleNameSubmit}>
                                    <div className="alert alert-info" style={{ fontSize: 14 }}>
                                        No existing application found for <strong>{email}</strong>. Please enter your name to begin.
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="firstName" className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            autoFocus
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success w-100" disabled={loading || !firstName || !lastName}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...</>
                                        ) : 'Start Application'}
                                    </button>
                                    <button type="button" className="btn btn-link w-100 mt-2" onClick={() => { setStep('email'); setError(''); }} disabled={loading}>
                                        Back
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
