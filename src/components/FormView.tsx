
import React, { useEffect, useState } from 'react';
import { store } from "../";
import { useHistory } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import {  toastBar } from "../index";
import { dialog } from "../services/DialogService";
import { saveForm } from "../services/ServerService";
import { logger } from "../utils/logger";
import { getTownsForLGA, lgaList } from "../services/storeService";
import { getApiUrl } from "../utils/formHelpers";
import { FormInput, FormTextarea, FormSelect } from "./FormComponents";



export const FormView = () => {
    const history = useHistory();
    const [towns, setTowns] = useState([] as string[]);

    // Form state: Basic text fields
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [studentMajor, setStudentMajor] = useState('');

    // Form state: Contact and profile fields
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [parentNames, setParentNames] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');
    const [collegeAddress, setCollegeAddress] = useState('');
    const [profile, setProfile] = useState('');

    // Form state: Location cascade and agreement
    const [lga, setLga] = useState('');
    const [homeTown, setHomeTown] = useState('');
    const [agreed, setAgreed] = useState(false);

    // Validation state
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [hasValidated, setHasValidated] = useState(false);


    const validateFields = (): string[] => {
        const errors: string[] = [];
        if (!firstName) errors.push('firstName');
        if (!lastName) errors.push('lastName');
        if (!studentId) errors.push('studentId');
        if (!collegeName) errors.push('collegeName');
        if (!studentMajor) errors.push('studentMajor');
        if (!gender) errors.push('gender');
        if (!age) errors.push('age');
        if (!phoneNumber) errors.push('phoneNumber');
        if (!email) errors.push('email');
        if (!address) errors.push('address');
        if (!parentNames) errors.push('parentNames');
        if (!admissionDate) errors.push('admissionDate');
        if (!collegeAddress) errors.push('collegeAddress');
        if (!profile) errors.push('profile');
        if (!lga) errors.push('lga');
        if (!homeTown) errors.push('homeTown');
        return errors;
}
    // LGA change handler with cascade reset
    const handleLgaChange = (selectedLga: string) => {
        setLga(selectedLga);
        const newTowns = getTownsForLGA(selectedLga);
        setTowns(newTowns);
        // Reset homeTown when LGA changes
        setHomeTown('');
    };

    // Helper for manual inline fields that don't use form components
    const getValidationClass = (fieldName: string): string => {
        if (!hasValidated) return '';
        return validationErrors.includes(fieldName) ? 'border-danger' : '';
    };

    // Unified file upload handler
    const handleFileUpload = async (
        formNumber: string,
        uploadType: 'admissionLetter' | 'passport'
    ): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,application/pdf';

            input.onchange = async (event: any) => {
                const files = event.target.files;
                if (!files || files.length === 0) {
                    resolve({ success: false });
                    return;
                }

                dialog.setBusy(true);
                try {
                    const formData = new FormData();
                    formData.append('image', files[0]);
                    formData.append('formNumber', formNumber);
                    formData.append('uploadType', uploadType);

                    const response = await fetch(`${getApiUrl()}/fileUpload.php`, {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();

                    dialog.setBusy(false);

                    if (result?.error) {
                        toastBar.error(result.message || 'Error uploading file');
                        resolve({ success: false, error: result.message });
                    } else {
                        resolve({ success: true });
                    }
                } catch (error) {
                    dialog.setBusy(false);
                    toastBar.error('Error uploading file');
                    resolve({ success: false, error: 'Upload failed' });
                }
            };

            input.click();
        });
    };



    const showErrors = (errorElements: string[]) => {
        dialog.showErrorDialog(
            'Incomplete Form',
            <div>
                <b>{errorElements.length} field{errorElements.length > 1 ? 's are' : ' is'} incomplete.</b><br /><br />
                If you leave now, your progress will be saved but your form will remain incomplete.<br /><br />
                Please complete all fields before submitting.
            </div>,
            <>
                <Button variant="secondary" onClick={() => { dialog.hideDialog(); history.push('/'); }}>Leave Anyway</Button>
                <Button variant="primary" onClick={() => dialog.hideDialog()}>Continue Filling</Button>
            </>
        );
    }
    // Show upload dialog with unified logic
    const showUploadDialog = (
        formNumber: string,
        uploadType: 'admissionLetter' | 'passport',
        onComplete: () => void
    ) => {
        const config = {
            admissionLetter: {
                title: 'Upload Admission Letter',
                description: 'Please click Upload to select and upload your letter of admission. If you do not currently have letter of admission, click Skip to continue.'
            },
            passport: {
                title: 'Upload Passport Sized Photo',
                description: 'Please click Upload to select and upload your passport sized photo. If you do not currently have a passport sized photo, click Skip to continue.'
            }
        };

        const { title, description } = config[uploadType];

        dialog.showDialog(
            title,
            <div>{description}</div>,
            <>
                <Button onClick={() => {
                    dialog.hideDialog();
                    onComplete();
                }}>Skip</Button>
                <Button onClick={async () => {
                    await handleFileUpload(formNumber, uploadType);
                    dialog.hideDialog();
                    onComplete();
                }}>Upload</Button>
            </>
        );
    };

    useEffect(() => {
        fillForm();
    }, []);
    const closeView = () => {
        // Run the same validation as submit
        const errors:string[]=validateFields();
        if (errors.length > 0) {
            setValidationErrors(errors);
            setHasValidated(true);
            showErrors(errors);
        } else {
            history.push('/');
        }
    }
    const fillForm = () => {
        const formData: any = store.formData;
        logger.info(`formData: ${JSON.stringify(formData)}`);

        // Set basic text fields from stored data
        if (formData.firstName) setFirstName(formData.firstName);
        if (formData.middleName) setMiddleName(formData.middleName);
        if (formData.lastName) setLastName(formData.lastName);
        if (formData.studentId) setStudentId(formData.studentId);
        if (formData.collegeName) setCollegeName(formData.collegeName);
        if (formData.studentMajor) setStudentMajor(formData.studentMajor);

        // Set contact and profile fields from stored data
        if (formData.gender) setGender(formData.gender);
        if (formData.age) setAge(formData.age);
        if (formData.phoneNumber) setPhoneNumber(formData.phoneNumber);
        if (formData.email) setEmail(formData.email);
        if (formData.address) setAddress(formData.address);
        if (formData.parentNames) setParentNames(formData.parentNames);
        if (formData.admissionDate) setAdmissionDate(formData.admissionDate);
        if (formData.collegeAddress) setCollegeAddress(formData.collegeAddress);
        if (formData.profile) setProfile(formData.profile);

        // Set location cascade state from stored data
        if (formData.lga) {
            setLga(formData.lga);
            const towns = getTownsForLGA(formData.lga);
            setTowns(towns);
            if (formData.homeTown) {
                setHomeTown(formData.homeTown);
            }
        }
    }

    // Start upload flow: admission letter -> passport photo -> navigation
    const startUploadFlow = (formNumber: string) => {
        showUploadDialog(formNumber, 'admissionLetter', () => {
            showUploadDialog(formNumber, 'passport', () => {
                // Navigate to preview page instead of lastViewPage
                history.push(`/preview/${formNumber}`);
            });
        });
    };


    const sendForm = (method: string) => {
        const body: any = document.querySelector('body') || { scrollTop: 0 };

        let jsonData: any = { formNumber: undefined, email: undefined };
        let errorElements = [];

            // Collect basic text field values
            jsonData.firstName = firstName;
            jsonData.middleName = middleName;
            jsonData.lastName = lastName;
            jsonData.studentId = studentId;
            jsonData.collegeName = collegeName;
            jsonData.studentMajor = studentMajor;

            // Collect contact and profile field values
            jsonData.gender = gender;
            jsonData.age = age;
            jsonData.phoneNumber = phoneNumber;
            jsonData.email = email;
            jsonData.address = address;
            jsonData.parentNames = parentNames;
            jsonData.admissionDate = admissionDate;
            jsonData.collegeAddress = collegeAddress;
            jsonData.profile = profile;

            // Collect location and agreement values
            jsonData.lga = lga;
            jsonData.homeTown = homeTown;
            jsonData.agreed = agreed;

            // Validate all required fields
            errorElements = validateFields();

            // Update validation state
            setValidationErrors(errorElements);
            setHasValidated(true);

            let currentFormNumber = store.formNo;
            if (currentFormNumber) {
                jsonData.formNumber = currentFormNumber;
                method = 'updateRecord';
            }
            if (errorElements.length > 0) {
                showErrors(errorElements);
                body.scrollIntoView();
            }
            else {

                let params = { method: method, params: jsonData };

                saveForm(params, (resp, error) => {
                    if (error) {
                        body.scrollIntoView();
                        toastBar.error('Error saving form');
                    } else {
                        logger.info('form saved:', resp.data.formNumber);
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
                            startUploadFlow(resp.data.formNumber);
                        }}>Ok</Button>
                        )

                    }
                })
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
                    <FormInput label="First Name" fieldName="firstName" value={firstName} setValue={setFirstName} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <FormInput label="Middle Name" fieldName="middleName" value={middleName} setValue={setMiddleName} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <FormInput label="Last Name" fieldName="lastName" value={lastName} setValue={setLastName} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <div className="row">
                        <div className="asa-label col-sm-2">
                            Gender :
                        </div>
                        <div className="col-sm-4">
                            <select className={`form-control input-sm ${getValidationClass('gender')}`} name="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}>
                                <option value=""></option>
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
                                className={`form-control input-sm ${getValidationClass('age')}`} />
                        </div>
                    </div>
                    <FormTextarea label="Address" fieldName="address" value={address} setValue={setAddress} rows={2} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            Phone # :
                        </div>
                        <div className="col-sm-4">
                            <input type="tel" name="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className={`form-control input-sm ${getValidationClass('phoneNumber')}`} />
                        </div>
                        <div className="asa-label col-sm-2">
                            Email Address :
                        </div>
                        <div className="col-sm-4">
                            <input type="email" name="email"
                                value={email}
                                readOnly
                                className="form-control input-sm"
                                style={{ backgroundColor: '#e9ecef' }} />

                        </div>
                    </div>
                    <FormTextarea label="Parent Names" fieldName="parentNames" value={parentNames} setValue={setParentNames} rows={2} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <div className="row">

                        <div className="asa-label col-sm-2">
                            LGA :
                        </div>
                        <div className="col-sm-4">
                            <select className={`form-control input-sm ${getValidationClass('lga')}`} name="lga"
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
                            <select className={`form-control input-sm ${getValidationClass('homeTown')}`} name="homeTown"
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
                    <FormInput label="Student ID" fieldName="studentId" value={studentId} setValue={setStudentId} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <FormInput label="Date of Admission" fieldName="admissionDate" value={admissionDate} setValue={setAdmissionDate} type="date" validationErrors={validationErrors} hasValidated={hasValidated} />
                    <FormInput label="Name of College" fieldName="collegeName" value={collegeName} setValue={setCollegeName} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <FormTextarea label="Address of College" fieldName="collegeAddress" value={collegeAddress} setValue={setCollegeAddress} rows={2} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <FormInput label="Proposed Major" fieldName="studentMajor" value={studentMajor} setValue={setStudentMajor} validationErrors={validationErrors} hasValidated={hasValidated} />
                    <hr />
                    <div className="label-info" style={{ textAlign: "center", fontSize: 16 }}>
                        Brief personal profile with information such as school attended, personal achievements, hobbies, GPA, future goals, etc.
                    </div>
                    <FormTextarea
                        label="Personal Profile"
                        fieldName="profile"
                        value={profile}
                        setValue={setProfile}
                        rows={10}
                        maxLength={1000}
                        placeholder="Maximum of 1000 characters. Please be concise and to the point."
                        style={{ height: "50px" }}
                        validationErrors={validationErrors}
                        hasValidated={hasValidated}
                    />
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
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className='input-md' />
                            </div>
                        </div>
                    </div>
                    <Row>
                        <Col sm={{ offset: 10, span: 4 }}>
                            <button type="submit" style={{ margin: 5 }}
                                className="btn btn-success"
                                disabled={!agreed}
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


