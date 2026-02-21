
import React, { useEffect, useState } from 'react';
import { store } from "../";
import { useHistory } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import { BusySpinner, toastBar } from "../index";
import { dialog } from "../services/DialogService";
import { saveForm } from "../services/ServerService";
import { getTownsForLGA, lgaList } from "../services/storeService";
import { get } from 'http';
import { isEmail } from "../utils/validation";
import { getApiUrl } from "../utils/formHelpers";



export const FormView = () => {
    const history = useHistory();
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [towns, setTowns] = useState([] as string[]);

    // Phase 2 Group A: Form state for simple text fields
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [studentMajor, setStudentMajor] = useState('');

    // Phase 2 Group B: Form state for complex fields
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [parentNames, setParentNames] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');
    const [collegeAddress, setCollegeAddress] = useState('');
    const [profile, setProfile] = useState('');

    // Phase 2 Group C: Cascade dropdowns and checkbox
    const [lga, setLga] = useState('');
    const [homeTown, setHomeTown] = useState('');
    const [agreed, setAgreed] = useState(false);

    // Phase 2 Group C: New LGA change handler (eliminates setTimeout hack)
    const handleLgaChange = (selectedLga: string) => {
        setLga(selectedLga);
        const newTowns = getTownsForLGA(selectedLga);
        setTowns(newTowns);
        // Reset homeTown when LGA changes (no setTimeout needed!)
        setHomeTown('');
    };

    // Old functions kept for backward compatibility during migration
    function loadTownsForLGA(selectedLga: string) {
        const towns = getTownsForLGA(selectedLga);
        setTowns(towns);

        // Reset homeTown selection to empty when LGA changes
        setTimeout(() => {
            const form = document.querySelector('#form');
            const homeTownField = form?.querySelector('[name="homeTown"]') as HTMLSelectElement;
            if (homeTownField) {
                homeTownField.selectedIndex = 0; // Reset to first option (empty)
            }
        });
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

        // Phase 2 Group A: Set controlled component state
        if (formData.firstName) setFirstName(formData.firstName);
        if (formData.middleName) setMiddleName(formData.middleName);
        if (formData.lastName) setLastName(formData.lastName);
        if (formData.studentId) setStudentId(formData.studentId);
        if (formData.collegeName) setCollegeName(formData.collegeName);
        if (formData.studentMajor) setStudentMajor(formData.studentMajor);

        // Phase 2 Group B: Set controlled component state
        if (formData.gender) setGender(formData.gender);
        if (formData.age) setAge(formData.age);
        if (formData.phoneNumber) setPhoneNumber(formData.phoneNumber);
        if (formData.email) setEmail(formData.email);
        if (formData.address) setAddress(formData.address);
        if (formData.parentNames) setParentNames(formData.parentNames);
        if (formData.admissionDate) setAdmissionDate(formData.admissionDate);
        if (formData.collegeAddress) setCollegeAddress(formData.collegeAddress);
        if (formData.profile) setProfile(formData.profile);

        // Phase 2 Group C: Set cascade dropdown state
        if (formData.lga) {
            setLga(formData.lga);
            const towns = getTownsForLGA(formData.lga);
            setTowns(towns);
            if (formData.homeTown) {
                setHomeTown(formData.homeTown);
            }
        }

        const form = document.querySelector('#form');
        if (form) {
            const arrayData = new FormData(form as HTMLFormElement);
            arrayData.forEach((value: FormDataEntryValue, key: string, parent: FormData) => {
                const aField = form?.querySelector('[name="' + key + '"]') as HTMLFormElement;
                if (aField) {
                    aField.style.borderColor = ''
                }
                // Skip Group A, B, C fields - they're now controlled
                if (['firstName', 'middleName', 'lastName', 'studentId', 'collegeName', 'studentMajor',
                     'gender', 'age', 'phoneNumber', 'email', 'address', 'parentNames',
                     'admissionDate', 'collegeAddress', 'profile', 'lga', 'homeTown', 'aggreed'].includes(key)) {
                    return;
                }
                if (formData[key]) {
                    aField.value = formData[key];
                }
            });
        }


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

            // Phase 2 Group A: Add controlled component values to jsonData
            jsonData.firstName = firstName;
            jsonData.middleName = middleName;
            jsonData.lastName = lastName;
            jsonData.studentId = studentId;
            jsonData.collegeName = collegeName;
            jsonData.studentMajor = studentMajor;

            // Phase 2 Group B: Add controlled component values to jsonData
            jsonData.gender = gender;
            jsonData.age = age;
            jsonData.phoneNumber = phoneNumber;
            jsonData.email = email;
            jsonData.address = address;
            jsonData.parentNames = parentNames;
            jsonData.admissionDate = admissionDate;
            jsonData.collegeAddress = collegeAddress;
            jsonData.profile = profile;

            // Phase 2 Group C: Add cascade dropdown values to jsonData
            jsonData.lga = lga;
            jsonData.homeTown = homeTown;
            jsonData.aggreed = agreed;

            // Check Group A fields for empty values
            if (!firstName) errorElements.push('firstName');
            if (!lastName) errorElements.push('lastName');
            if (!studentId) errorElements.push('studentId');
            if (!collegeName) errorElements.push('collegeName');
            if (!studentMajor) errorElements.push('studentMajor');

            // Check Group B fields for empty values
            if (!gender) errorElements.push('gender');
            if (!age) errorElements.push('age');
            if (!phoneNumber) errorElements.push('phoneNumber');
            if (!email) errorElements.push('email');
            if (!address) errorElements.push('address');
            if (!parentNames) errorElements.push('parentNames');
            if (!admissionDate) errorElements.push('admissionDate');
            if (!collegeAddress) errorElements.push('collegeAddress');
            if (!profile) errorElements.push('profile');

            // Check Group C fields for empty values
            if (!lga) errorElements.push('lga');
            if (!homeTown) errorElements.push('homeTown');

            // Loop through form elements directly (includes disabled fields)
            const elements = (form as HTMLFormElement).elements;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

                // Skip elements without a name (like buttons)
                if (!element.name) continue;

                // Skip all controlled fields (Groups A, B, C) - they're now in React state
                if (['firstName', 'middleName', 'lastName', 'studentId', 'collegeName', 'studentMajor',
                     'gender', 'age', 'phoneNumber', 'email', 'address', 'parentNames',
                     'admissionDate', 'collegeAddress', 'profile', 'lga', 'homeTown', 'aggreed'].includes(element.name)) {
                    continue;
                }

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
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="form-control input-sm" />
                        </div>

                    </div>

                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Middle Name :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" name="middleName"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                className="form-control input-sm" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Last Name :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" name="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="form-control input-sm" />
                        </div>
                    </div>
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            Gender :
                        </div>
                        <div className="col-sm-4">
                            <select className="form-control input-sm" name="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}>
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
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="form-control input-sm" />

                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Address :
                        </div>
                        <div className="col-sm-10 controls">
                            <textarea className="form-control col-sm-10" rows={2}
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            Phone # :
                        </div>
                        <div className="col-sm-4">
                            <input type="tel" name="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="form-control input-sm" />
                        </div>
                        <div className="asa-label col-sm-2">
                            Email Address :
                        </div>
                        <div className="col-sm-4">
                            <input type="email" name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                name="parentNames"
                                value={parentNames}
                                onChange={(e) => setParentNames(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            LGA :
                        </div>
                        <div className="col-sm-4">
                            <select className="form-control input-sm" name="lga"
                                value={lga}
                                onChange={(e) => handleLgaChange(e.target.value)}>
                                <option value=""> </option>
                                {lgaList.map((lga: any, index: number) => {
                                    return <option key={index} value={lga}>{lga}</option>
                                })}
                            </select>

                        </div>

                        <div className="asa-label col-sm-2">
                            Home Town :
                        </div>
                        <div className="col-sm-4">
                            <select className="form-control input-sm" name="homeTown"
                                value={homeTown}
                                onChange={(e) => setHomeTown(e.target.value)}
                                disabled={towns.length === 0}>
                                <option value=""> </option>
                                {towns.map((town, index) => (
                                    <option key={index} value={town}>{town}</option>
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
                            <input type="text" className="form-control input-sm" name="studentId"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Date of Admission :
                        </div>
                        <div className="col-sm-10 controls">
                            <input type="date" className="form-control input-sm" name="admissionDate"
                                value={admissionDate}
                                onChange={(e) => setAdmissionDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Name of College :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" className="form-control input-sm" name="collegeName"
                                value={collegeName}
                                onChange={(e) => setCollegeName(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Address of College :
                        </div>
                        <div className="col-sm-10">
                            <textarea className="form-control col-sm-10" rows={2} id="comment" name="collegeAddress"
                                value={collegeAddress}
                                onChange={(e) => setCollegeAddress(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Proposed Major :
                        </div>
                        <div className="col-sm-10">
                            <input type="text" className="form-control input-sm" name="studentMajor"
                                value={studentMajor}
                                onChange={(e) => setStudentMajor(e.target.value)} />
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
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
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
                                <input type="checkbox" id="agreed" name="aggreed"
                                    checked={agreed}
                                    onChange={(e) => {
                                        setAgreed(e.target.checked);
                                        setSubmitDisabled(!e.target.checked);
                                    }}
                                    className='input-md' />
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


