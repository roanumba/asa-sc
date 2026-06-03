import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { fetchWithoutToken } from '../services/ServerService';

interface ApplicationData {
    formNumber: string;
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    age: number;
    address: string;
    phoneNumber: string;
    email: string;
    parentNames: string;
    homeTown: string;
    lga: string;
    studentId: string;
    admissionDate: string;
    collegeName: string;
    collegeAddress: string;
    studentMajor: string;
    profile: string;
    admissionLetter: string;
    passport: string;
    timeStamp: string;
    passportExists?: boolean;
    letterExists?: boolean;
}

export const AdminApplicationDetail: React.FC = () => {
    const { formNumber } = useParams<{ formNumber: string }>();
    const history = useHistory();
    const [appData, setAppData] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const isAuthenticated = await authService.checkSession();
        if (!isAuthenticated) {
            history.push('/admin/login');
        } else {
            loadApplication();
        }
    };

    const loadApplication = async () => {
        try {
            setLoading(true);
            const response = await fetchWithoutToken(`/applications/${formNumber}`);
            if (response && response.success) {
                setAppData(response.data);
            } else {
                setError(response?.error || 'Failed to load application');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !appData) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error || 'Application not found'}</div>
                <button className="btn btn-secondary" onClick={() => history.push('/admin/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Application Details: {appData.formNumber}</h2>
                <button className="btn btn-secondary" onClick={() => history.push('/admin/dashboard')}>
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Personal Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Full Name</div>
                                <div className="col-md-8 fw-bold">{appData.firstName} {appData.middleName} {appData.lastName}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Email</div>
                                <div className="col-md-8">{appData.email}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Phone Number</div>
                                <div className="col-md-8">{appData.phoneNumber}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Gender / Age</div>
                                <div className="col-md-8">{appData.gender} / {appData.age}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Address</div>
                                <div className="col-md-8">{appData.address}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Parent Names</div>
                                <div className="col-md-8">{appData.parentNames}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Home Town / LGA</div>
                                <div className="col-md-8">{appData.homeTown} / {appData.lga}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">College Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">College Name</div>
                                <div className="col-md-8 fw-bold">{appData.collegeName}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">College Address</div>
                                <div className="col-md-8">{appData.collegeAddress}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Student ID</div>
                                <div className="col-md-8">{appData.studentId}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Student Major</div>
                                <div className="col-md-8">{appData.studentMajor}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-4 text-muted">Admission Date</div>
                                <div className="col-md-8">{appData.admissionDate}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">Personal Statement / Profile</h5>
                        </div>
                        <div className="card-body">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{appData.profile}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-warning">
                            <h5 className="mb-0">Documents</h5>
                        </div>
                        <div className="card-body">
                            <h6 className="mt-3 border-bottom pb-2">Passport Photo</h6>
                            {appData.passport && appData.passportExists ? (
                                <div className="text-center mb-4">
                                    <img 
                                        src={`${baseName}server/passports/${appData.passport}`} 
                                        alt="Passport" 
                                        className="img-fluid img-thumbnail"
                                        style={{ maxHeight: '200px' }}
                                    />
                                    <div className="mt-2">
                                        <a href={`${baseName}server/passports/${appData.passport}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">View Full Size</a>
                                    </div>
                                </div>
                            ) : appData.passport ? (
                                <div className="alert alert-warning py-1" title={`File: ${appData.passport}`}>File missing on server</div>
                            ) : (
                                <div className="alert alert-danger py-1">Not uploaded</div>
                            )}

                            <h6 className="mt-4 border-bottom pb-2">Admission Letter</h6>
                            {appData.admissionLetter && appData.letterExists ? (
                                <div className="text-center mb-2">
                                    {appData.admissionLetter.toLowerCase().endsWith('.pdf') ? (
                                        <div>
                                            <i className="bi bi-file-pdf" style={{ fontSize: '3rem', color: 'red' }}></i>
                                            <div className="mt-2">
                                                <a href={`${baseName}server/images/${appData.admissionLetter}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">View PDF</a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <img 
                                                src={`${baseName}server/images/${appData.admissionLetter}`} 
                                                alt="Admission Letter" 
                                                className="img-fluid img-thumbnail"
                                                style={{ maxHeight: '200px' }}
                                            />
                                            <div className="mt-2">
                                                <a href={`${baseName}server/images/${appData.admissionLetter}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">View Full Size</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : appData.admissionLetter ? (
                                <div className="alert alert-warning py-1" title={`File: ${appData.admissionLetter}`}>File missing on server</div>
                            ) : (
                                <div className="alert alert-danger py-1">Not uploaded</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="card shadow-sm">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">Metadata</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-2">
                                <strong>Submitted:</strong><br />
                                {new Date(appData.timeStamp).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
