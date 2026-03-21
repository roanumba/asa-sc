import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { fetchWithoutToken } from '../services/ServerService';
import { store } from '../';

type Step = 'email' | 'name' | 'verify';

export const NewFormGate: React.FC = () => {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [formNumberInput, setFormNumberInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const resetState = () => {
        setStep('email');
        setEmail('');
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setFormNumberInput('');
    };

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
                // Already has a verified form — send to login/continue
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
                body: JSON.stringify({ email, firstName, middleName, lastName }),
            });

            if (response && response.success) {
                // Temp record created and form number emailed — move to verify step
                setStep('verify');
            } else if (response?.status === 409) {
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

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetchWithoutToken('/applications/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, formNumber: formNumberInput.trim().toUpperCase() }),
            });

            if (response && response.success) {
                const { formNumber } = response.data;
                store.formNo = formNumber;
                store.formData = { email, firstName, middleName, lastName, formNumber } as any;
                history.push('/formViewPage');
            } else if (response?.status === 410) {
                // 3 failed attempts — record deleted, must start completely over
                resetState();
                setError(response.error || 'Too many incorrect attempts. Please start again.');
            } else if (response?.status === 401) {
                // Wrong code but attempts remaining — stay on verify step
                setFormNumberInput('');
                setError(response.error || 'Incorrect form number. Please try again.');
            } else {
                setError(response?.error || 'Verification failed. Please try again.');
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
                                        No existing application found for <strong>{email}</strong>. Please enter your full name to begin.
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
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
                                        <label htmlFor="middleName" className="form-label">Middle Name <span className="text-muted" style={{ fontSize: 12 }}>(optional)</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="middleName"
                                            value={middleName}
                                            onChange={(e) => setMiddleName(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
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
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...</>
                                        ) : 'Send Verification Code'}
                                    </button>
                                    <button type="button" className="btn btn-link w-100 mt-2" onClick={() => { setStep('email'); setError(''); }} disabled={loading}>
                                        Back
                                    </button>
                                </form>
                            )}

                            {step === 'verify' && (
                                <form onSubmit={handleVerifySubmit}>
                                    <div className="alert alert-success" style={{ fontSize: 14 }}>
                                        A form number has been sent to <strong>{email}</strong>. Please enter it below to verify your email and activate your application.
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="formNumberInput" className="form-label">Form Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="formNumberInput"
                                            value={formNumberInput}
                                            onChange={(e) => setFormNumberInput(e.target.value)}
                                            placeholder="Enter the form number from your email"
                                            required
                                            autoFocus
                                            disabled={loading}
                                            style={{ textTransform: 'uppercase', letterSpacing: 2 }}
                                        />
                                        <div className="form-text">Check your inbox (and spam folder). If you cannot verify, your temporary record will be removed and you will need to start again.</div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading || !formNumberInput.trim()}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verifying...</>
                                        ) : 'Verify & Continue'}
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
