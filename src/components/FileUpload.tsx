import React from "react";
import { dialog } from "../services/DialogService";
import { clientService } from "../services/ServerService";
//                 'Content-Type': 'application/json',
//load an image or pdf file.

let uploadButton: HTMLButtonElement | null = null;

const action = (formNo: string, type: string) => [

    <button key={2} className="btn btn-danger" onClick={() => {
        dialog.hideDialog();
    }}>Cancel</button>,

];
const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

/**
 * Uploads a file to the server after validating its type and size.
 *
 * @param {string} formNo - The form number associated with the file upload.
 * @param {any} files - The file(s) to be uploaded. Expected to be an array-like object.
 * @param {string} type - The type/category of the file being uploaded.
 *
 * @remarks
 * - The function validates the file type against a predefined list of valid types (`validTypes`).
 * - The file size must not exceed 2 MB (2,097,152 bytes).
 * - If validation passes, the file is uploaded using `clientService.uploadFile`.
 * - Displays appropriate dialogs for success, error, or invalid input scenarios.
 *
 * @example
 * ```typescript
 * const files = document.getElementById('fileInput').files;
 * upload("12345", files, "document");
 * ```
 *
 * @throws Will display an error dialog if:
 * - No file is selected.
 * - The file type is invalid.
 * - The file size exceeds 2 MB.
 * - An error occurs during the upload process.
 */
const upload = (formNo: string, files: any, type: string) => {
    return new Promise((resolve, reject) => {

        if (files && files.length > 0) {
            const oneFile = files[0];
            if (validTypes.includes(oneFile.type)) {
                if (oneFile.size <= 2097152) {
    
                    clientService.uploadFile(formNo, oneFile, type, (resp, error) => {
                        if (error) {
                            console.error(error)
                            reject(["File Upload Error", "An error occurred while uploading the file."]);
                        } else {
                            resolve(oneFile.name);
                        }
                    });
                }
                else {
                    reject(["File Upload Error",
                        "File size MUST be less than 2 MB."]);
                }
            } else {
                reject(["Invalid file type.",
                    <>Please upload file of type:<br />{validExtensions.join(", ")}.</>
                ]);
            }
        } else {
            reject(["File Upload Error", "No file selected."]);
        }

    });
}

export const uploadLetterOfAdmision = (formNo: string, callback=()=>{}) => {

    dialog.showDialog(
        "Upload Letter of Admission",
        <div>
            Please click <b>Choose File</b> to load a copy of your letter of admission.
            If you do not currently have letter of admission, click <b>Cancel</b> to continue.
            <input type="file" id="uploadId" accept="image/*,application/pdf"
                onChange={(e) => {
                    const file = e.target as HTMLInputElement;
                    const promise=upload(formNo, file.files, "letter")
                    handlePromise(promise, formNo, callback);

                }} />
        </div>,
        [

            <button key={2} className="btn btn-danger" onClick={() => {
                dialog.hideDialog();
            }}>Cancel</button>,

        ]

    );
    

}
export const uploadPassportSizedPhoto = (formNo: string, callback=()=>{}) => {

    dialog.showDialog(
        "Upload Passport Sized Photo",
        <div>
            Please click <b>Choose File</b> to upload your passport Sized Photo.<br />
            If you do not currently have the photo, click <b>Cancel</b> to continue.
            <input type="file" id="uploadId" accept="application/pdf,image/*"
                onChange={(e) => {
                    const file = e.target as HTMLInputElement;
                    const promise=upload(formNo, file.files, "passport")
                    handlePromise(promise, formNo, callback);

                }}
            />
        </div>,
        [
            <button key={2} className="btn btn-danger" onClick={() => {
                dialog.hideDialog();
                callback();
            }}>Cancel</button>,

        ]
    )
}

function handlePromise(promise: Promise<unknown>, formNo: string, callback: () => void) {
    promise.then((resp) => {
        dialog.showDialog("File Upload", <div>
           File <b>{`"${resp}"`}</b> uploaded successfully.
        </div>, [
            <button className="btn btn-danger" onClick={() => {
                dialog.hideDialog();
            }}>Ok</button>
        ])
    }).catch((err) => {
        dialog.showErrorDialog(
            err[0],
            err[1]
        );
    });
}
