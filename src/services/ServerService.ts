import {dialog} from "./DialogService";

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
        responseData = {error: true, e};
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
        responseData = {error: e};
    }
    dialog.setBusy(false);
    return responseData;
};

export class ServerService {
    /* constructor(private dialog: DialogService, private router: Router,
                 public store: StoreService) {
         klass = this;
     }

     private uploadToSever(file, formNumber,type, dialog) {
         let url = "server/fileUpload.php";
         let fd = new FormData();

         fd.append('image', file);
         fd.append('formNumber', formNumber);
         fd.append('uploadType', type);

         $.ajax({
             url: url,
             type: "POST",
             data: fd,
             processData: false,
             contentType: false,
             success: (data, textStatus, jqXHR) => {
                 let jData = JSON.parse(data);
                 let dlgType = undefined;
                 let title = "Admission Letter Uploaded";
                 if (type==='passport') {
                     title = "Passport Photo Uploaded";
                 }
                 if (jData.error) {
                     dlgType = BootstrapDialog.TYPE_DANGER;
                     title = "Upload error"
                 }
                 let dlg = this.dialog.showDialog(title, jData.message, null, dlgType);
                 dlg.options.onhidden = function () {
                     if (!jData.error) {
                         dialog.close();
                     }
                 };
             },
             error: function (jqXHR, textStatus, errorThrown) {
                 $('#uploadResponse').html('error ' + textStatus + ' ' + errorThrown);

             }
         });
     }



     private showLastPage(msgFunc: (dialog) => any,type, lastPage) {
         let dlgType = BootstrapDialog.TYPE_WARNING;
         let title = "Admission Letter";
         if (type==='passport') {
             dlgType = BootstrapDialog.TYPE_SUCCESS;
             title = "Passport Sized Photo";
         }
         let dlg = this.dialog.showDialog(
             title,
             msgFunc,
             [
                 {
                     label: "Cancel",
                     action: function (d) {
                         d.close();
                     }
                 }
             ],dlgType
         );
         if (lastPage) {
             dlg.options.onhidden = () => {
                 this.router.navigate(['lastPage'])
             };
         }
         return  dlg;
     }
 */

    public saveForm = async (params: { method: string; params: any }, callback: (data: any, error: any) => void) => {

        const resp: any = await post(`/formService.php`, params);
        if (resp.error) {
            callback(null, resp.error)
        }
        else {
            callback(resp, null)
        }
    }

    public uploadFile = (formNumber: string, file: string) => {

        if (file === 'letter') {
            this.uploadAdmissionLetter(formNumber)
        }
        else if (file === 'passport') {
            this.uploadPassportSizedPhoto(formNumber)
        }
        else if (file === 'both') {
            let dlg: any = this.uploadAdmissionLetter(formNumber);
            dlg.options.onhidden = () => {
                this.uploadPassportSizedPhoto(formNumber, true);
            };
        }
    }

    private uploadAdmissionLetter(formNumber: string, lastPage = false) {
        let msgFunc = function (dialog) {

            let msg = `<div>
              Your application has been save. Please click <b>Choose File</b> to load a copy of your letter of admission. 
              If you do not currently have letter of admission, click <b>Cancel</b> to continue.
              <input type="file" id="admissionLetter" accept="image/!*,application/pdf"/>
              </div>`;
            msg.find("#admissionLetter").change((e) => {
                if (this.files.length > 0) {
                    klass.uploadToSever(this.files[0], formNumber, 'letter', dialog);
                }
            });
            return msg;
        };
        return this.showLastPage(msgFunc, 'letter', lastPage);
    }

    private uploadPassportSizedPhoto(formNumber, lastPage?) {
        let msgFunc = function (dialog) {

            let msg = $(`<div>
              Your application has been save. Please click <b>Choose File</b> to load your passport sized photo. 
              If you do not currently have your passport sized photo, click <b>Cancel</b> to continue.
              <input type="file" id="passport" accept="image/!*"/>
              </div>`);
            msg.find("#passport").change(function (e) {
                if (this.files.length > 0) {
                    klass.uploadToSever(this.files[0], formNumber, 'passport', dialog);
                }
            });
            return msg;
        };
        return this.showLastPage(msgFunc, 'passport', lastPage);
    }

}

const clientService = new ServerService();
export {clientService}

