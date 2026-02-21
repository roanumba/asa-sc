
import React, { useEffect, useState } from 'react';
import { store } from "../";
import { useHistory } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import { BusySpinner, toastBar } from "../index";
import { dialog } from "../services/DialogService";
import { saveForm } from "../services/ServerService";
import { getTownsForLGA, lgaList } from "../services/storeService";
import { get } from 'http';

// Get API base URL from <base> tag
const getApiUrl = () => {
    const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';
    return `${baseName}server`;
};



export const FormView = () => {
    const history = useHistory();
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [towns, setTowns] = useState([] as string[]);

    function loadTownsForLGA(selectedLga: string) {
        const towns = getTownsForLGA(selectedLga);
        setTowns(towns);
        
    }
    
    function setHomeTownValue(homeTown: string) {
        setTimeout(() => {
            const form = document.querySelector('#form');
            const homeTownField = form?.querySelector('[name="homeTown"]') as HTMLSelectElement;
            if (homeTownField && homeTown) {
                homeTownField.value = homeTown;
            }
        });
    }

    useEffect(() => {
        BusySpinner.setBusy(true);
        setTimeout(() => {
            BusySpinner.setBusy(false)
            fillForm();
        }, 1000)
    }, []);
    const closeView = () => {
        history.push('/');
    }
    /*
    * document.querySelector('#form').querySelectorAll('[name]')[0].style.border=''
    * document.querySelector('#form').querySelectorAll('[name]')[0].style.borderColor='red'
    * */

    const fillForm = () => {
        const formData: any = store.formData;
        console.log(`formData: ${JSON.stringify(formData)}`);

        const form = document.querySelector('#form');
        if (form) {
            const arrayData = new FormData(form as HTMLFormElement);
            arrayData.forEach((value: FormDataEntryValue, key: string, parent: FormData) => {
                const aField = form?.querySelector('[name="' + key + '"]') as HTMLFormElement;
                if (aField) {
                    aField.style.borderColor = ''
                }
                if (formData[key]) {
                    aField.value = formData[key];
                }
            });

            // If LGA has a value, load the towns for that LGA
            if (formData.lga) {
                loadTownsForLGA(formData.lga);

                // Set homeTown value after towns are loaded
                // We need to wait for the state to update
                setHomeTownValue(formData.homeTown);
            }
        }


    }
    function isEmail(email: string) {
        let emailReg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
        return emailReg.test(email);
    }
    const uploadAdmissionLetter = (formNumber: string) => {
        dialog.showDialog('Upload Admission Letter',
            <div>Please click <b>Upload</b> to select and upload your letter of admission.
                If you do not currently have letter of admission, click <b>Skip</b> to continue.</div>,
            <>
                <Button onClick={() => {
                    dialog.hideDialog();
                    uploadPassportSizedPhoto(formNumber, false);
                }}>Skip</Button>
                <Button onClick={(e) => {
                    // Open file dialog directly from this click event
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*,application/pdf';

                    input.onchange = async (event: any) => {
                        const files = event.target.files;
                        if (!files || files.length === 0) {
                            uploadPassportSizedPhoto(formNumber, false);
                            return;
                        }

                        dialog.setBusy(true);
                        try {
                            const formData = new FormData();
                            formData.append('image', files[0]);
                            formData.append('formNumber', formNumber);
                            formData.append('uploadType', 'admissionLetter');

                            const response = await fetch(`${getApiUrl()}/fileUpload.php`, {
                                method: 'POST',
                                body: formData
                            });
                            const result = await response.json();

                            dialog.setBusy(false);

                            if (result?.error) {
                                toastBar.error(result.message || 'Error uploading admission letter');
                            }

                            uploadPassportSizedPhoto(formNumber, false);
                        } catch (error) {
                            dialog.setBusy(false);
                            toastBar.error('Error uploading admission letter');
                            uploadPassportSizedPhoto(formNumber, false);
                        }
                    };

                    // Trigger file selection
                    input.click();
                }}>Upload</Button>
            </>);
    }
    const uploadPassportSizedPhoto = (formNumber: string, skip: boolean) => {
        dialog.showDialog('Upload Passport Sized Photo',
            <div>Please click <b>Upload</b> to select and upload your passport sized photo.
                If you do not currently have a passport sized photo, click <b>Skip</b> to continue.</div>,
            <>
                <Button onClick={() => {
                    dialog.hideDialog();
                    history.push('/lastViewPage');
                }}>Skip</Button>
                <Button onClick={(e) => {
                    // Open file dialog directly from this click event
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*,application/pdf';

                    input.onchange = async (event: any) => {
                        const files = event.target.files;
                        if (!files || files.length === 0) {
                            dialog.hideDialog();
                            history.push('/lastViewPage');
                            return;
                        }

                        dialog.setBusy(true);
                        try {
                            const formData = new FormData();
                            formData.append('image', files[0]);
                            formData.append('formNumber', formNumber);
                            formData.append('uploadType', 'passport');

                            const response = await fetch(`${getApiUrl()}/fileUpload.php`, {
                                method: 'POST',
                                body: formData
                            });
                            const result = await response.json();

                            dialog.setBusy(false);

                            if (result?.error) {
                                toastBar.error(result.message || 'Error uploading passport photo');
                            }

                            dialog.hideDialog();
                            history.push('/lastViewPage');
                        } catch (error) {
                            dialog.setBusy(false);
                            toastBar.error('Error uploading passport photo');
                            dialog.hideDialog();
                            history.push('/lastViewPage');
                        }
                    };

                    // Trigger file selection
                    input.click();
                }}>Upload</Button>
            </>);
    }


    const sendForm = (method: string) => {
        const form = document.querySelector('#form');
        const body: any = document.querySelector('body') || { scrollTop: 0 };

        if (form) {
            let jsonData: any = { formNumber: undefined, email: undefined };
            let errorElements = [];

            // Loop through form elements directly (includes disabled fields)
            const elements = (form as HTMLFormElement).elements;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

                // Skip elements without a name (like buttons)
                if (!element.name) continue;

                // Reset border color
                if (element.style) {
                    element.style.borderColor = '';
                }

                // Get the value
                const value = element.value;

                // Check for empty required fields
                if (value === "") {
                    errorElements.push(element.name);
                    if (element.style) {
                        element.style.borderColor = 'red';
                    }
                }

                // Add to jsonData
                jsonData[element.name] = value;
            }

            let currentFormNumber = store.formNo;
            if (currentFormNumber) {
                jsonData.formNumber = currentFormNumber;
                method = 'updateRecord';
            }
            if (errorElements.length > 0) {
                dialog.showErrorDialog(
                    "Form Error",
                    errorElements.length + " fields are empty. Please fill them and resubmit"
                );
                body.scrollIntoView();
            }
            else if (!isEmail(jsonData.email)) {
                dialog.showErrorDialog(
                    "Form Error",
                    <><b>  {jsonData.email}  </b> is not a valid email address.</>
                );
                body.scrollIntoView();
            }
            else {

                let params = { method: method, params: jsonData };

                saveForm(params, (resp, error) => {
                    if (error) {
                        body.scrollIntoView();
                        toastBar.error('Error saving form');
                    } else {
                        console.log(resp);

                        // const resp = {data:{formNumber:'1234'}}
                        console.log(resp.data.formNumber);
                        store.formNo = resp.data.formNumber;
                        dialog.showDialog(
                            "Form Saved", <div>
                            <div>
                                Your form was saved successfully!<br />
                                Your form number is: <b>{resp.data.formNumber}</b><br />
                                Please write it down for future reference and <br />
                                for updating your application form <br />
                                or uploading your letter of admission<br />
                                or uploading your passport photograph.<br />
                                <br />
                                <span style={{ color: 'red' }}>
                                    The form number is also sent to your email address.
                                </span>
                            </div>
                        </div>, <Button onClick={() => {
                            uploadAdmissionLetter(resp.data.formNumber);
                        }}>Ok</Button>
                        )

                    }
                })

            }
        }
    };
    return <form id={'form'} onSubmit={(e) => e.preventDefault()}>
        <button id="closeView" className="btn btn-danger float-end btn-sm" title="Close" style={{ margin: 30 }} onClick={closeView}>X</button>

        <div className="" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <br />
            <div className="panel panel-primary">
                <div className="panel-heading">
                    <img className="row float-start" src="anamlogo2.PNG" style={{ width: "8%", height: "8%", color: "white" }} />
                    <img className="row float-end" src="aswalogo2.png" style={{ width: "8%", height: "8%", color: "white" }} />
                    <div className="panel-title" style={{ fontSize: 14, textAlign: "center" }}>
                        Anambra State Association of southern California <br />
                        and <br />
                        Anambra State Women Association of Southern California
                    </div>
                </div>
                <div className="label-warning" style={{ textAlign: "center", fontSize: 19, marginTop: 1 }}>
                    {store.year} Scholarship Form
                </div>
                <div className="panel-body">
                    <div className="label-info" style={{ textAlign: "center", fontSize: 16 }}>
                        Personal Information
                    </div>
                    <hr />
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            First Name :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" name="firstName"
                                className="form-control input-sm" />
                        </div>

                    </div>

                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Middle Name :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" name="middleName"
                                className="form-control input-sm" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Last Name :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" name="lastName"
                                className="form-control input-sm" />
                        </div>
                    </div>
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            Gender :
                        </div>
                        <div className="col-sm-4">
                            <select className="form-control input-sm" name="gender">
                                <option></option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div className="asa-label col-sm-2">
                            Age :
                        </div>
                        <div className="col-sm-4">
                            <input type="number" min="15" max="23" name="age"

                                className="form-control input-sm" />

                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Address :
                        </div>
                        <div className="col-sm-10 controls">
                            <textarea className="form-control col-sm-10" rows={2}
                                name="address" />
                        </div>
                    </div>
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            Phone # :
                        </div>
                        <div className="col-sm-4">
                            <input type="tel" name="phoneNumber"
                                className="form-control input-sm" />
                        </div>
                        <div className="asa-label col-sm-2">
                            Email Address :
                        </div>
                        <div className="col-sm-4">
                            <input type="email" name="email"
                                className="form-control input-sm"
                                placeholder="Current email is very important to communicate with you" />

                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Parent Names :
                        </div>
                        <div className="col-sm-10 controls">
                            <textarea className="form-control col-sm-10" rows={2}
                                name="parentNames" />
                        </div>
                    </div>
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            LGA :
                        </div>
                        <div className="col-sm-4">
                            <select className="form-control input-sm" name="lga" onChange={(e) => {
                                const selectedLga = e.target.value;
                                loadTownsForLGA(selectedLga);
                                setHomeTownValue(''); // Clear homeTown value when LGA changes

                            }}>
                                <option> </option>
                                {lgaList.map((lga: any, index: number) => {
                                    return <option key={index}>{lga}</option>
                                })}
                            </select>

                        </div>

                        <div className="asa-label col-sm-2">
                            Home Town :
                        </div>
                        <div className="col-sm-4">
                            <select className="form-control input-sm" name="homeTown" disabled={towns.length === 0}>
                                <option> </option>
                                {towns.map((town, index) => (
                                    <option key={index}>{town}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <hr />
                    <div className="label-info" style={{ textAlign: "center", fontSize: 16 }}>College Admission Information</div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Student ID :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" className="form-control input-sm" name="studentId" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Date of Admission :
                        </div>
                        <div className="col-sm-10 controls">
                            <input type="date" className="form-control input-sm" name="admissionDate" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Name of College :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" className="form-control input-sm" name="collegeName" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Address of College :
                        </div>
                        <div className="col-sm-10">
                            <textarea className="form-control col-sm-10" rows={2} id="comment" name="collegeAddress" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Proposed Major :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" className="form-control input-sm" name="studentMajor" />
                        </div>
                    </div>
                    <hr />
                    <div className="label-info" style={{ textAlign: "center", fontSize: 16 }}>
                        Brief personal profile with information such as school attended, personal achievements, hobbies, GPA, future goals, etc.
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Personal Profile:
                        </div>
                        <div className="col-sm-10">
                            <textarea className="form-control col-sm-10"
                                rows={10} maxLength={1000} id="profile" name="profile"
                                style={{ height: "50px" }} placeholder="Maximum of 1000 characters. Please be concise and to the point."
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 panel-body">
                            I affirm the information that I have (will) provided on
                            this application, or any supportive materials, is (will be)
                            complete, accurate, and true to the best of my knowledge.
                            I understand that furnishing false information may result
                            in not being considered or revocation of financial aid at
                            some later date. I understand that, if selected for a scholarship,
                            you may use my name, photograph and/or testimonial for promotion
                            and public relations purposes.
                            <div className="float-end" >
                                <b style={{ marginRight: 20 }}>Agree</b>
                                <input type="checkbox" id="agreed" name="aggreed" onChange={(e) => {
                                    setSubmitDisabled(!e.target.checked)
                                }} className='input-md' />
                            </div>
                        </div>
                    </div>
                    <Row>
                        <Col sm={{ offset: 10, span: 4 }}>
                            <button type="submit" style={{ margin: 5 }}
                                className="btn btn-success"
                                disabled={submitDisabled}
                                onClick={(e) => {
                                    e.preventDefault();
                                    sendForm("submitForm");
                                }}
                            >Submit
                            </button>
                        </Col>

                    </Row>


                </div>

            </div>
        </div>



    </form>;
};


