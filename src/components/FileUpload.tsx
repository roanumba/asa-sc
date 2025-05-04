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
    // <button key={1} className="btn btn-primary btn-upload" onClick={()=>{
    //     upload(formNo,type)
    // }
    // }>Upload</button>
];
const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

/* 
    if (in_array($file_ext, $extensions) === false) {
        $msg .= 'File type NOT allowed, please choose a PDF, JPEG or PNG file. ';
    } else if ($file_size > 2097152) {
        $msg .= 'File size MUST be less than 2 MB';
    }else
*/
const upload = (formNo: string, files: any, type: string) => {

    if (files && files.length > 0) {
        const oneFile = files[0];
        if (validTypes.includes(oneFile.type)) {
            if (oneFile.size <= 2097152) {

                clientService.uploadFile(formNo, oneFile, type, (resp, error) => {
                    if (error) {
                        console.error(error)
                        dialog.showErrorDialog("File Upload Error", "An error occurred while uploading the file.");
                    } else {
                        console.log(resp)
                        dialog.showDialog("File Upload", <div>
                            File uploaded successfully.
                        </div>, [
                            <button className="btn btn-danger" onClick={() => {
                                dialog.hideDialog();
                            }}>Ok</button>
                        ])

                    }
                });
            }
            else {
                dialog.showErrorDialog("File Upload Error", 
                    "File size MUST be less than 2 MB.");
            }
        } else {
            dialog.showErrorDialog("Invalid file type.",
                <>Please upload file of type:<br/>{validExtensions.join(", ")}.</>
            );
        }
    } else {
        dialog.showErrorDialog("File Upload Error", "No file selected.");
    }
}

export const uploadLetterOfAdmision = (formNo: string) => {

    dialog.showDialog(
        "Upload Letter of Admission",
        <div>
            Please click <b>Choose File</b> to load a copy of your letter of admission.
            If you do not currently have letter of admission, click <b>Cancel</b> to continue.
            <input type="file" id="uploadId" accept="image/*,application/pdf"
                onChange={(e) => {
                    const file = e.target as HTMLInputElement;
                    upload(formNo, file.files, "letter")
                }} />
        </div>,
        action(formNo, "letter")

    );

}
export const uploadPassportSizedPhoto = (formNo: string) => {

    dialog.showDialog(
        "Upload Passport Sized Photo",
        <div>
            Please click <b>Choose File</b> to upload your passport Sized Photo.<br />
            If you do not currently have the photo, click <b>Cancel</b> to continue.
            <input type="file" id="uploadId" accept="application/pdf,image/*"
                onChange={(e) => {
                    const file = e.target as HTMLInputElement;
                    upload(formNo, file.files, "passport")
                }}
            />
        </div>,
        action(formNo, "passport")
    )
}