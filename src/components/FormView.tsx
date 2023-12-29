
import React, {useEffect, useState} from 'react';
import {store} from "../services/storeService";
import {useHistory} from "react-router-dom";
import {Button, Col, Row} from "react-bootstrap";
import {BusySpinner} from "../index";
import {dialog} from "../services/DialogService";
import { saveForm, uploadFile} from "../services/ServerService";




export const FormView = () => {
    const history=useHistory() ;
    const [submitDisabled, setSubmitDisabled] = useState(true);
    useEffect(() => {
         BusySpinner.setBusy(true);
         setTimeout(()=>{
             BusySpinner.setBusy(false)
         },1000)
    }, []);
    const closeView=() =>{
        history.push('/') ;
    }
    /*
    * document.querySelector('#form').querySelectorAll('[name]')[0].style.border=''
    * document.querySelector('#form').querySelectorAll('[name]')[0].style.borderColor='red'
    * */


    function isEmail(email:string) {
        let emailReg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
        return emailReg.test(email);
    }
    const uploadAdmissionLetter=(formNumber:string)=>{
        dialog.showDialog('Upload Admission Letter',
            <div>Please click <b>Choose File</b> to load a copy of your letter of admission.
                If you do not currently have letter of admission, click <b>Cancel</b> to continue.</div>,
            <>
                <Button onClick={() => {
                    uploadPassportSizedPhoto(formNumber, false);
                }}>Cancel</Button>
                <Button onClick={() => {
                    uploadFile(formNumber,'admissionLetter',(resp,error)=>{
                        if (error){
                            console.log(error)
                        }
                        uploadPassportSizedPhoto(formNumber, false);
                    });

                }}>Upload</Button>
            </>);
    }
    const uploadPassportSizedPhoto=(formNumber:string, skip:boolean)=>{
        const dlg=dialog.showDialog('Upload Passport Sized Photo',
            <div>Please click <b>Choose File</b> to load a copy of your passport sized photo.
                If you do not currently have a passport sized photo, click <b>Cancel</b> to continue.</div>,
            <>
                <Button onClick={() => {}}>Cancel</Button>
                <Button onClick={() => {
                    uploadFile(formNumber,'passports',(resp,error)=>{
                        if (error){
                            console.log(error)
                        }
                    });                    
                }}>Upload</Button>
            </>);
    }


    const sendForm=(method:string)=> {
        const form = document.querySelector('#form');
        const body:any = document.querySelector('body') || {scrollTop:0};

        if (form) {
            const arrayData = new FormData(form as HTMLFormElement);

            let jsonData:any = {formNumber: undefined, email: undefined};
            let errorElements = [];

            arrayData.forEach((value: FormDataEntryValue, key: string, parent: FormData) => {
               const aField= form.querySelector('[name="' + key + '"]') as HTMLFormElement;
               if (aField)  {
                   aField.style.borderColor = ''
               }

                if (value === "") {
                    errorElements.push(key);
                    aField.style.borderColor = 'red'
                }
                jsonData[key] = value;
            });
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
                dialog.setBusy(true);
                let params = {method: method, params: jsonData};
                setTimeout(()=>{dialog.setBusy(false)},100);
                saveForm(params,(resp,error)=>{
                           if (error){
                               console.log(error)
                           }else{
                            console.log(resp);
                            
                    // const resp = {data:{formNumber:'1234'}}
                               console.log(resp.data.formNumber)  ;
                               store.formNo =   resp.data.formNumber;
                               dialog.showDialog(
                                "Form Saved",<div>
                                    <div>
                                        Your form was saved successfully!<br/>
                                        Your form number is: <b>{resp.data.formNumber}</b><br/>
                                        Please write it down for future reference and <br/>
                                        for updating your application form <br/>
                                        or uploading your letter of admission<br/>
                                        or uploading your passport photograph.<br/>
                                        <br/>
                                        <span style={{color:'red'}}>
                                            The form number is also sent to your email address.
                                        </span>
                                    </div>
                                </div>,<Button onClick={() => {
                                    uploadAdmissionLetter(resp.data.formNumber);
                                }}>Ok</Button>
                            )
                          
                         }  })

            }
        }
     };
    return <form id={'form'}>
            <button id="closeView" className="btn btn-danger float-end btn-sm" title="Close" style={{margin: 30}} onClick={closeView}>X</button>

            <div className="" style={{paddingLeft: 20,paddingRight: 20}}>
                <br/>
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <img className="row float-start" src="anamlogo2.PNG" style={{width:"8%", height:"8%",color: "white"}}/>
                        <img className="row float-end" src="aswalogo2.png" style={{width:"8%", height:"8%",color: "white"}}/>
                        <div className="panel-title" style={{fontSize: 14,textAlign: "center"}}>
                            Anambra State Association of southern California <br/>
                            and <br/>
                            Anambra State Women Association of Southern California
                        </div>
                    </div>
                    <div className="label-warning" style={{textAlign: "center", fontSize: 19 ,marginTop: 1}}>
                        {store.year} Scholarship Form
                    </div>
                    <div className="panel-body">
                        <div className="label-info" style={{textAlign: "center", fontSize: 16}}>
                            Personal Information
                        </div>
                        <hr/>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                First Name :
                            </div>
                            <div className="col-sm-10">
                                <input type="text" name="firstName"
                                       className="form-control input-sm"/>
                            </div>

                        </div>

                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Middle Name :
                            </div>
                            <div className="col-sm-10">
                                <input type="text" name="middleName"
                                       className="form-control input-sm"/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Last Name :
                            </div>
                            <div className="col-sm-10">
                                <input type="text" name="lastName"
                                       className="form-control input-sm"/>
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

                                       className="form-control input-sm"/>

                            </div>
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Address :
                            </div>
                            <div className="col-sm-10 controls">
                                <textarea className="form-control col-sm-10" rows={2}
                                          name="address"/>
                            </div>
                        </div>
                        <div className="row">

                            <div className="asa-label col-sm-2">
                                Phone # :
                            </div>
                            <div className="col-sm-4">
                                <input type="tel" name="phoneNumber"
                                       className="form-control input-sm"/>
                            </div>
                            <div className="asa-label col-sm-2">
                                Email Address :
                            </div>
                            <div className="col-sm-4">
                                <input type="email" name="email"
                                       className="form-control input-sm"
                                       placeholder="Current email is very important to communicate with you"/>

                            </div>
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Parent Names :
                            </div>
                            <div className="col-sm-10 controls">
                                <textarea className="form-control col-sm-10" rows={2}
                                          name="parentNames"/>
                            </div>
                        </div>
                        <div className="row">

                            <div className="asa-label col-sm-2">
                                Home Town :
                            </div>
                            <div className="col-sm-4">
                                <input type="text" name="homeTown"
                                       className="form-control input-sm"/>
                            </div>
                            <div className="asa-label col-sm-2">
                                LGA :
                            </div>
                            <div className="col-sm-4">
                                <select className="form-control input-sm" name="lga">
                                    <option> </option>
                                    <option>Aguata</option>
                                    <option>Aguata</option>
                                    <option>Awka North</option>
                                    <option>Awka South</option>
                                    <option>Anambra East</option>
                                    <option>Anambra West</option>
                                    <option>Anaocha</option>
                                    <option>Ayamelum</option>
                                    <option>Dunukofia</option>
                                    <option>Ekwusigo</option>
                                    <option>Idemili North</option>
                                    <option>Idemili South</option>
                                    <option>Ihiala</option>
                                    <option>Njikoka</option>
                                    <option>Nnewi North</option>
                                    <option>Nnewi South</option>
                                    <option>Ogbaru</option>
                                    <option>Onitsha North</option>
                                    <option>Onitsha South</option>
                                    <option>Orumba North</option>
                                    <option>Orumba South</option>
                                    <option>Oyi</option>
                                </select>

                            </div>
                        </div>

                        <hr/>
                        <div className="label-info" style={{textAlign: "center", fontSize: 16}}>College Admission Information</div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Student ID :
                            </div>
                            <div className="col-sm-10">
                                <input type="text" className="form-control input-sm" name="studentId"/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Date of Admission :
                            </div>
                            <div className="col-sm-10 controls">
                                <input type="date" className="form-control input-sm" name="admissionDate"/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Name of College :
                            </div>
                            <div className="col-sm-10">
                                <input type="text" className="form-control input-sm" name="collegeName"/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Address of College :
                            </div>
                            <div className="col-sm-10">
                                <textarea className="form-control col-sm-10" rows={2} id="comment" name="collegeAddress"/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Proposed Major :
                            </div>
                            <div className="col-sm-10">
                                <input type="text" className="form-control input-sm" name="studentMajor"/>
                            </div>
                        </div>
                        <hr/>
                        <div className="label-info" style={{textAlign: "center", fontSize: 16}}>
                            Brief personal profile with information such as school attended, personal achievements, hobbies, GPA, future goals, etc.
                        </div>
                        <div className="row">
                            <div className="asa-label col-sm-2">
                                Personal Profile:
                            </div>
                            <div className="col-sm-10">
                                <textarea className="form-control col-sm-10" rows={3} maxLength={1000} id="profile" name="profile"/>
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
                                <div className="float-end">
                                    <b>Agree</b>
                                    <input type="checkbox" id="agreed" name="aggreed" onChange={(e)=>{
                                        setSubmitDisabled(!e.target.checked)}}/>
                                </div>
                            </div>
                        </div>
                        <Row>
                            <Col  sm={{offset:10,span:4}}>
                                <button type="submit" style={{margin: 5}}
                                        className="btn btn-success"
                                        disabled={submitDisabled}
                                        onClick={(e)=>{
                                            e.preventDefault() ;
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


