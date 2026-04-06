import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { fetchWithoutToken } from '../services/ServerService';

interface Application {
    formNumber: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    collegeName: string;
    timeStamp: string;
    admissionLetter: string;
    passport: string;
    letterExists: boolean;
    passportExists: boolean;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const AdminDashboard: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const history = useHistory();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!loading) {
            loadApplications();
        }
    }, [pagination.page, search]);

    const checkAuth = async () => {
        const isAuthenticated = await authService.checkSession();
        if (!isAuthenticated) {
            history.push('/admin/login');
        } else {
            setLoading(false);
            loadApplications();
        }
    };

    const loadApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (search) {
                params.append('search', search);
            }

            const response = await fetchWithoutToken(`/admin/applications?${params.toString()}`);

            if (response && response.success) {
                setApplications(response.data.applications);
                setPagination(response.data.pagination);
                setError('');
            } else {
                setError(response?.error || 'Failed to load applications');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        history.push('/admin/login');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        loadApplications();
    };

    const handleExport = async () => {
        const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';
        const apiUrl = `${baseName}server/api`;
        window.open(`${apiUrl}/admin/export`, '_blank');
    };

    const handleGeneratePDF = () => {
        const year = new Date().getFullYear();
        const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';
        const url = `${baseName}server/GPDF.php`;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = '_blank';
        const yearInput = document.createElement('input');
        yearInput.type = 'hidden';
        yearInput.name = 'year';
        yearInput.value = String(year);
        const acdInput = document.createElement('input');
        acdInput.type = 'hidden';
        acdInput.name = 'accd';
        acdInput.value = 'AsaGpdf||';
        form.appendChild(yearInput);
        form.appendChild(acdInput);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid mt-3">
            <div className="row mb-3">
                <div className="col">
                    <h2>Admin Dashboard</h2>
                </div>
                <div className="col-auto">
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <form onSubmit={handleSearch} className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, email, or form number..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">
                                    Search
                                </button>
                                {search && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setSearch('');
                                            setPagination({ ...pagination, page: 1 });
                                        }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </form>
                        </div>
                        <div className="col-md-4 text-end d-flex gap-2 justify-content-end">
                            <button className="btn btn-success" onClick={handleExport}>
                                <i className="bi bi-download"></i> Export CSV
                            </button>
                            <button className="btn btn-secondary" onClick={handleGeneratePDF}>
                                <i className="bi bi-file-pdf"></i> Generate PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">
                                    Applications ({pagination.total})
                                </h5>
                                <small className="text-muted">
                                    Page {pagination.page} of {pagination.totalPages}
                                </small>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Form Number</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>College</th>
                                            <th>Submitted</th>
                                            <th>Documents</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4">
                                                    No applications found
                                                </td>
                                            </tr>
                                        ) : (
                                            applications.map((app) => (
                                                <tr key={app.formNumber}>
                                                    <td>
                                                        <code>{app.formNumber}</code>
                                                    </td>
                                                    <td>
                                                        {app.firstName} {app.middleName} {app.lastName}
                                                    </td>
                                                    <td>{app.email}</td>
                                                    <td>{app.phoneNumber}</td>
                                                    <td>{app.collegeName}</td>
                                                    <td>{formatDate(app.timeStamp)}</td>
                                                    <td>
                                                        <div className="d-flex gap-1 flex-wrap">
                                                            {app.letterExists ? (
                                                                <span className="badge bg-success" title={app.admissionLetter}>
                                                                    Letter ✓
                                                                </span>
                                                            ) : app.admissionLetter ? (
                                                                <span className="badge bg-warning text-dark" title={`File missing: ${app.admissionLetter}`}>
                                                                    Letter ⚠
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-danger" title="Admission letter not uploaded">
                                                                    No Letter
                                                                </span>
                                                            )}
                                                            {app.passportExists ? (
                                                                <span className="badge bg-success" title={app.passport}>
                                                                    Photo ✓
                                                                </span>
                                                            ) : app.passport ? (
                                                                <span className="badge bg-warning text-dark" title={`File missing: ${app.passport}`}>
                                                                    Photo ⚠
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-danger" title="Passport photo not uploaded">
                                                                    No Photo
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <nav className="mt-3">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </button>
                                </li>

                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        // Show first, last, current, and adjacent pages
                                        return page === 1 ||
                                            page === pagination.totalPages ||
                                            Math.abs(page - pagination.page) <= 1;
                                    })
                                    .map((page, index, array) => {
                                        // Add ellipsis
                                        const prevPage = array[index - 1];
                                        const showEllipsis = prevPage && page - prevPage > 1;

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsis && (
                                                    <li className="page-item disabled">
                                                        <span className="page-link">...</span>
                                                    </li>
                                                )}
                                                <li className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setPagination({ ...pagination, page })}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            </React.Fragment>
                                        );
                                    })}

                                <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
};
