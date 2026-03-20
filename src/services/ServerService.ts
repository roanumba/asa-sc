import { dialog } from "./DialogService";
import { logger } from "../utils/logger";

// Get base URL from <base> tag or fallback to '/'
const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';

// Use new REST API endpoints
const apiUrl = `${baseName}server/api`;
const legacyApiUrl = `${baseName}server`;
export const fetchWithoutToken = async (path: string, init?: RequestInit) => {
    try {
        let data = null;
        const resp = await fetch(`${apiUrl}${path}`, init);
        logger.info(`fetching: ${path}, status: ${resp.status}`);
        if (resp.ok) {
            data = await resp.json();
            logger.info('response data:', data);
        } else {
            const errorText = await resp.text();
            logger.error(`HTTP Error ${resp.status}:`, errorText);
            return null;
        }
        return data;
    }
    catch (e) {
        logger.error('Fetch error:', e);
        return Promise.reject(e);
    }
};
export const fetchWithoutTokenText = async (path: string, init?: RequestInit) => {
    try {
        let data = null;
        const resp = await fetch(`${apiUrl}${path}`, init);
        if (resp.ok) {
            data = await resp.text();
        }
        logger.info(`fetching: ${path}`);
        return data;
    }
    catch (e) {
        return Promise.reject(e);
    }
};

export const handleResponse = (response: Response) => {
    if (response.status === 204) {
        return {};
    }
    else if (response.status === 404) {
        return Promise.reject(response);
    }
    return response.json().then((json) => {
        if (!response.ok) {
            const error = {
                ...json,
                status: response.status,
                statusText: response.statusText,
            };
            return Promise.reject(error);
        }
        return json;
    });
};
export const get = async (path: string) => {
    dialog.setBusy(true);
    let responseData;
    try {
        responseData = await fetchWithoutToken(path);
    }
    catch (e) {
        responseData = { error: true, e };
    }
    dialog.setBusy(false);
    return responseData;
};

export const post = async (path: string, body: any) => {
    dialog.setBusy(true);
    let responseData;
    try {
        responseData = await fetchWithoutToken(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

    }
    catch (e) {
        responseData = { error: e };
    }
    dialog.setBusy(false);
    return responseData;
};

export const postTextResponse = async (path: string, body: any) => {
    dialog.setBusy(true);
    let responseData;
    try {
        responseData = await fetchWithoutTokenText(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

    }
    catch (e) {
        responseData = { error: e };
    }
    dialog.setBusy(false);
    return responseData;
};

const openFileDialog = (fileType: string) => {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = fileType;
    input.click();
    return input;
}


export const uploadFile = (formNumber: string, file: string, callback: (resp: any, error: any) => void) => {
    dialog.setBusy(true);

    const input = openFileDialog('image/*,application/pdf');
    let hasFileSelected = false;

    // Handle file selection
    input.onchange = async (e: any) => {
        hasFileSelected = true;
        try {
            const files = e.target.files;

            // Check if files were actually selected
            if (!files || files.length === 0) {
                dialog.setBusy(false);
                callback({ error: true, message: 'No file selected' }, null);
                return;
            }

            const formData = new FormData();
            formData.append('image', files[0]);
            formData.append('formNumber', formNumber);
            formData.append('uploadType', file);

            // File upload still uses legacy endpoint for now
            const response = await fetch(`${legacyApiUrl}/fileUpload.php`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            dialog.setBusy(false);
            callback(result, null);
        } catch (error) {
            dialog.setBusy(false);
            callback(null, error);
        }
    };

    // Detect when file dialog is canceled (user clicks cancel or closes dialog)
    // Use a timeout to check if user canceled the file selection
    const checkCancellation = () => {
        setTimeout(() => {
            // If window regains focus and no file was selected, user likely canceled
            if (!hasFileSelected) {
                dialog.setBusy(false);
                callback({ error: true, message: 'File selection canceled' }, null);
            }
        }, 300);
    };

    // Listen for window focus to detect dialog dismissal
    window.addEventListener('focus', checkCancellation, { once: true });
}
export const saveForm = async (params: { method: string; params: any }, callback: (data: any, error: any) => void) => {
    // Determine if this is a create or update based on method
    const isUpdate = params.method === 'updateRecord';
    const formData = params.params;

    try {
        const endpoint = isUpdate
            ? `/applications/${formData.formNumber}`
            : `/applications`;

        const method = isUpdate ? 'PUT' : 'POST';

        const response = await fetchWithoutToken(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response && response.success) {
            callback({ data: response.data }, null);
        } else {
            callback(null, response?.error || 'Unknown error');
        }
    } catch (error) {
        callback(null, error);
    }
}

export const findForm = async (formNo: string, callback: (d: any, err: any) => void) => {
    dialog.setBusy(true);

    try {
        const response = await fetchWithoutToken(`/applications/${formNo}`);

        if (response && response.success) {
            // Keep the structure that FormView expects: { data: {...} }
            callback({ data: response.data }, null);
        } else {
            callback(null, response?.error || 'Application not found');
        }
    } catch (error) {
        callback(null, error);
    } finally {
        dialog.setBusy(false);
    }
}

export const loadLastForm = async (params: any, callback: (d: any, err: any) => void) => {
    try {
        // LastPage still uses legacy endpoint - call it directly without going through REST API
        const resp = await fetch(`${legacyApiUrl}/lastPage.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const textResponse = await resp.text();
        const data = JSON.parse(textResponse);

        if (data.error) {
            callback(null, data.error);
        } else {
            callback(data, null);
        }
    } catch (error) {
        callback(null, error);
    } finally {
        dialog.setBusy(false);
    }
}



