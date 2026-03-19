import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { store } from '../';
import { findForm } from '../services/ServerService';

type Step = 'email' | 'formNumber' | 'notFound';

export const ApplicantLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [formNumber, setFormNumber] = useState('');
    const [step, setStep] = useState<Step>('email');
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
                setStep('formNumber');
            } else {
                setStep('notFound');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleFormNumberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.lookupApplicant(email, formNumber);

            if (result.verified && result.formNumber) {
                // Load application data then navigate to preview
                findForm(result.formNumber, (jsonData: any, err: any) => {
                    if (err || !jsonData?.data) {
                        setError('Could not load application. Please try again.');
                        setLoading(false);
                        return;
                    }
                    store.formData = jsonData.data;
                    store.formNo = result.formNumber!;
                    history.push(`/preview/${result.formNumber}`);
                });
            } else {
                setError(result.error || 'Invalid form number');
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
        }
    };

    const startNewForm = () => {
        store.formData = [];
        store.formNo = '';
        // Pre-fill email if available
        if (email) store.prefillEmail = email;
        history.push('/formViewPage');
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h3 className="card-title text-center mb-1">View / Continue Application</h3>
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
                                            type="text"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email or username"
                                            required
                                            autoFocus
                                            disabled={loading}
                                        />
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

                            {step === 'formNumber' && (
                                <form onSubmit={handleFormNumberSubmit}>
                                    <div className="alert alert-info" style={{ fontSize: 14 }}>
                                        An application was found for <strong>{email}</strong>. Enter your form number to continue.
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="formNumber" className="form-label">Form Number</label>
                                        <input
                                            type="text"
                                            className="form-control text-uppercase"
                                            id="formNumber"
                                            value={formNumber}
                                            onChange={(e) => setFormNumber(e.target.value.toUpperCase())}
                                            placeholder="e.g. 67ABC123"
                                            required
                                            autoFocus
                                            disabled={loading}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading || !formNumber}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verifying...</>
                                        ) : 'View Application'}
                                    </button>
                                    <button type="button" className="btn btn-link w-100 mt-2" onClick={() => { setStep('email'); setError(''); }} disabled={loading}>
                                        Use a different email
                                    </button>
                                </form>
                            )}

                            {step === 'notFound' && (
                                <div>
                                    <div className="alert alert-warning" style={{ fontSize: 14 }}>
                                        No application found for <strong>{email}</strong>.
                                    </div>
                                    <button className="btn btn-success w-100" onClick={startNewForm}>
                                        Start a New Form
                                    </button>
                                    <button type="button" className="btn btn-link w-100 mt-2" onClick={() => { setStep('email'); setError(''); setEmail(''); }}>
                                        Try a different email
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
