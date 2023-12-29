import { dialog } from "./DialogService";

const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';


const apiUrl = `${baseName}server`;
export const fetchWithoutToken = async (path: string, init?: RequestInit) => {
    try {
        let data = null;
        const resp = await fetch(`${apiUrl}${path}`, init);
        if (resp.ok) {
            data = await resp.json();
        }
        console.log(`fetching: ${path}`);
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


const  openFileDialog = (fileType: string) => {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = fileType;
    input.click();
    return input;
}


export const uploadFile = (formNumber: string, file: string, callback:(resp: any, error: any)=>void) => {

    try {
            openFileDialog('image/*,application/pdf').onchange =async (e:any) => {
                const files=e.target.files;
                const formData = new FormData();
                formData.append('image',files[0]);
                formData.append('formNumber',formNumber);
                formData.append('uploadType',file);

                const response = await fetch(`${apiUrl}/fileUpload.php`,{
                    method:'POST',
                    body:formData
                } );
                const result = await response.json();
                
                callback(result, null)
               
            }
    } catch (error) {
        callback(null, error)
    }
        
     
    }
export const saveForm = async (params: { method: string; params: any }, callback: (data: any, error: any) => void) => {

    const resp: any = await post(`/formService.php`, params);
    if (resp.error) {
        callback(null, resp.error)
    }
    else {
        callback(resp, null)
    }
}
