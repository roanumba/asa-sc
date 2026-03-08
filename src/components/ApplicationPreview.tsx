import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { DocumentPreview } from './DocumentPreview';
import { DocumentReplaceModal } from './DocumentReplaceModal';
import { fetchWithoutToken } from '../services/ServerService';
import { store } from '../index';

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
}

export const ApplicationPreview: React.FC = () => {
    const { formNumber } = useParams<{ formNumber: string }>();
    const history = useHistory();
    const [data, setData] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [replaceDocType, setReplaceDocType] = useState<'admissionLetter' | 'passport'>('admissionLetter');
    const [fileExistence, setFileExistence] = useState<{
        admissionLetter: boolean;
        passport: boolean;
    }>({ admissionLetter: false, passport: false });

    useEffect(() => {
        initializeAndLoad();
    }, [formNumber]);

    const initializeAndLoad = async () => {
        // Initialize store (loads config) before loading application
        await store.init();
        await loadApplication();
    };

    const loadApplication = async () => {
        try {
            setLoading(true);
            const response = await fetchWithoutToken(`/applications/${formNumber}`);

            if (response && response.success) {
                setData(response.data);
                setError('');
                // Check if files actually exist
                await checkFileExistence(response.data);
            } else {
                setError(response?.error || 'Failed to load application');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const checkFileExistence = async (appData: ApplicationData) => {
        const baseUrl = window.location.origin;
        const basePath = document.querySelector('base')?.getAttribute('href') ?? '/';
        const cleanBasePath = basePath.replace(/\/$/, '');

        const existence = {
            admissionLetter: false,
            passport: false
        };

        // Check admission letter
        if (appData.admissionLetter) {
            try {
                const response = await fetch(
                    `${baseUrl}${cleanBasePath}/server/viewFile.php?form=${formNumber}&type=admissionLetter`,
                    { method: 'HEAD' }
                );
                existence.admissionLetter = response.ok;
            } catch {
                existence.admissionLetter = false;
            }
        }

        // Check passport
        if (appData.passport) {
            try {
                const response = await fetch(
                    `${baseUrl}${cleanBasePath}/server/viewFile.php?form=${formNumber}&type=passport`,
                    { method: 'HEAD' }
                );
                existence.passport = response.ok;
            } catch {
                existence.passport = false;
            }
        }

        setFileExistence(existence);
    };

    const handleEdit = (section: string) => {
        if (!data) return;

        if (section === 'documents') {
            // Don't navigate to FormView for documents, they'll use the replace modal
            return;
        }

        // Store the application data so FormView can load it
        store.formData = data as any;
        store.formNo = formNumber;

        // Navigate to FormView to edit
        history.push('/formViewPage');
    };

    const handleReplaceDocument = (docType: 'admissionLetter' | 'passport') => {
        setReplaceDocType(docType);
        setShowReplaceModal(true);
    };

    const handleReplaceSuccess = () => {
        // Reload the application data to show the new document
        loadApplication();
    };

    const handleSubmit = () => {
        // Set form number in store before navigating to confirmation page
        store.formNo = formNumber;
        // Navigate to confirmation page
        history.push('/lastViewPage');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isComplete = (appData: ApplicationData | null) => {
        if (!appData) return false;
        // Check both database entries AND physical file existence
        return !!(
            appData.admissionLetter &&
            fileExistence.admissionLetter &&
            appData.passport &&
            fileExistence.passport
        );
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading application...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error || 'Application not found'}</p>
                    <hr />
                    <button className="btn btn-primary" onClick={() => history.push('/')}>
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="row mb-4">
                <div className="col">
                    <h2>Application Preview</h2>
                    <p className="text-muted">
                        Form Number: <code className="fs-5">{formNumber}</code>
                    </p>
                </div>
                <div className="col-auto">
                    {data.timeStamp && (
                        <small className="text-muted">
                            Submitted: {formatDate(data.timeStamp)}
                        </small>
                    )}
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Personal Information</h5>
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit('personal')}
                    >
                        <i className="bi bi-pencil"></i> Edit
                    </button>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <strong>First Name:</strong>
                            <p>{data.firstName}</p>
                        </div>
                        <div className="col-md-4">
                            <strong>Middle Name:</strong>
                            <p>{data.middleName || 'N/A'}</p>
                        </div>
                        <div className="col-md-4">
                            <strong>Last Name:</strong>
                            <p>{data.lastName}</p>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <strong>Gender:</strong>
                            <p>{data.gender}</p>
                        </div>
                        <div className="col-md-4">
                            <strong>Age:</strong>
                            <p>{data.age}</p>
                        </div>
                        <div className="col-md-4">
                            <strong>Phone Number:</strong>
                            <p>{data.phoneNumber}</p>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <strong>Email:</strong>
                            <p>{data.email}</p>
                        </div>
                        <div className="col-md-6">
                            <strong>Parent/Guardian Names:</strong>
                            <p>{data.parentNames}</p>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-12">
                            <strong>Address:</strong>
                            <p>{data.address}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <strong>LGA:</strong>
                            <p>{data.lga}</p>
                        </div>
                        <div className="col-md-6">
                            <strong>Home Town:</strong>
                            <p>{data.homeTown}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* College Information Section */}
            <div className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">College Information</h5>
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit('college')}
                    >
                        <i className="bi bi-pencil"></i> Edit
                    </button>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <strong>College Name:</strong>
                            <p>{data.collegeName}</p>
                        </div>
                        <div className="col-md-6">
                            <strong>Student ID:</strong>
                            <p>{data.studentId}</p>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-12">
                            <strong>College Address:</strong>
                            <p>{data.collegeAddress}</p>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <strong>Major/Course of Study:</strong>
                            <p>{data.studentMajor}</p>
                        </div>
                        <div className="col-md-6">
                            <strong>Admission Date:</strong>
                            <p>{data.admissionDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div className="card mb-3">
                <div className="card-header">
                    <h5 className="mb-0">Documents</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Admission Letter</h6>
                                {data.admissionLetter && fileExistence.admissionLetter && (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleReplaceDocument('admissionLetter')}
                                    >
                                        <i className="bi bi-arrow-repeat"></i> Replace
                                    </button>
                                )}
                            </div>
                            {data.admissionLetter && fileExistence.admissionLetter ? (
                                <DocumentPreview
                                    fileName={data.admissionLetter}
                                    type="letter"
                                    formNumber={formNumber}
                                />
                            ) : data.admissionLetter && !fileExistence.admissionLetter ? (
                                <div className="alert alert-danger">
                                    <i className="bi bi-exclamation-triangle-fill"></i> File Missing
                                    <div className="mt-2">
                                        <small className="text-muted d-block">
                                            Database shows: <del>{data.admissionLetter}</del>
                                        </small>
                                        <small className="text-muted d-block mb-2">
                                            File not found on server. Please upload again.
                                        </small>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-danger w-100"
                                        onClick={() => handleReplaceDocument('admissionLetter')}
                                    >
                                        <i className="bi bi-upload"></i> Upload Again
                                    </button>
                                </div>
                            ) : (
                                <div className="alert alert-warning">
                                    <i className="bi bi-exclamation-triangle"></i> Not uploaded
                                    <button
                                        className="btn btn-sm btn-warning mt-2 w-100"
                                        onClick={() => handleReplaceDocument('admissionLetter')}
                                    >
                                        Upload Now
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Passport Photo</h6>
                                {data.passport && fileExistence.passport && (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleReplaceDocument('passport')}
                                    >
                                        <i className="bi bi-arrow-repeat"></i> Replace
                                    </button>
                                )}
                            </div>
                            {data.passport && fileExistence.passport ? (
                                <DocumentPreview
                                    fileName={data.passport}
                                    type="passport"
                                    formNumber={formNumber}
                                />
                            ) : data.passport && !fileExistence.passport ? (
                                <div className="alert alert-danger">
                                    <i className="bi bi-exclamation-triangle-fill"></i> File Missing
                                    <div className="mt-2">
                                        <small className="text-muted d-block">
                                            Database shows: <del>{data.passport}</del>
                                        </small>
                                        <small className="text-muted d-block mb-2">
                                            File not found on server. Please upload again.
                                        </small>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-danger w-100"
                                        onClick={() => handleReplaceDocument('passport')}
                                    >
                                        <i className="bi bi-upload"></i> Upload Again
                                    </button>
                                </div>
                            ) : (
                                <div className="alert alert-warning">
                                    <i className="bi bi-exclamation-triangle"></i> Not uploaded
                                    <button
                                        className="btn btn-sm btn-warning mt-2 w-100"
                                        onClick={() => handleReplaceDocument('passport')}
                                    >
                                        Upload Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile/Statement Section */}
            <div className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Personal Statement</h5>
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit('profile')}
                    >
                        <i className="bi bi-pencil"></i> Edit
                    </button>
                </div>
                <div className="card-body">
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {data.profile || 'No personal statement provided'}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="row mb-4">
                <div className="col-12">
                    {!isComplete(data) && (
                        <div className="alert alert-warning mb-3">
                            <i className="bi bi-exclamation-circle"></i> Please upload all required documents before submitting
                        </div>
                    )}
                </div>
                <div className="col-12 d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={() => history.push('/')}>
                        <i className="bi bi-house"></i> Home
                    </button>

                    {data.timeStamp ? (
                        <button
                            className="btn btn-info btn-lg"
                            onClick={handleSubmit}
                        >
                            <i className="bi bi-check-circle"></i> View Confirmation Page
                        </button>
                    ) : (
                        <button
                            className="btn btn-success btn-lg"
                            onClick={handleSubmit}
                            disabled={!isComplete(data)}
                        >
                            <i className="bi bi-send"></i> Submit Application
                        </button>
                    )}
                </div>
            </div>

            {/* Document Replace Modal */}
            {data && (
                <DocumentReplaceModal
                    show={showReplaceModal}
                    formNumber={formNumber}
                    documentType={replaceDocType}
                    currentFileName={
                        replaceDocType === 'admissionLetter'
                            ? data.admissionLetter || ''
                            : data.passport || ''
                    }
                    onClose={() => setShowReplaceModal(false)}
                    onSuccess={handleReplaceSuccess}
                />
            )}
        </div>
    );
};
