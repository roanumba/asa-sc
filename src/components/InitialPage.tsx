import {Button, Col, Row, Card} from "react-bootstrap";
import React, {useEffect,useState} from "react";
// import {navigateTo} from "../App";
import {useHistory} from "react-router-dom";
import {store} from "../";
import {dialog} from "../services/DialogService";
import { findForm, uploadFile} from "../services/ServerService";
import { toastBar } from "..";


const uploadType = {
    passport:{
        title: "Upload Passport Sized Photo",
        message: "Upload a passport sized photo of yourself.",
        action: "Upload Photo",
        errorMsg: "Form Number is required to upload passport sized photo."
    },
    letter:{
        title: "Upload Letter of Admission",
        message: "Upload your letter of admission.",
        action: "Upload Letter",
        errorMsg: "Form Number is required to upload letter of admission."
    },
    form:{
        title: "Edit Completed Form",
        message: "Edit your completed form.",
        action: "Edit Form",
        errorMsg: "Form Number is required to edit completed form."
    }
} as any;

export const InitialPage = () => {

    const history = useHistory();

    useEffect(() => {
        dialog.setBusy(true);
        setTimeout(() => { dialog.setBusy(false); }, 1000);
    }, []);


          
       const newForm=()=> {
           history.push('/new-form');
       }

       const viewApplication = () => {
           history.push('/applicant/login');
       }

       const upload = (type:string) => {
   
            const formNo=store.formNo;
            if (type === "passport") {
                findForm(formNo, (jsonData:any,error:any) => {
                    if (error || !jsonData.data) {
                        toastBar.error("Error finding form with number: '" + formNo + "'.");
                    }else{
                    store.formData = jsonData.data;
                    uploadFile(formNo,type,(resp,error)=>{
                        if (error){
                            toastBar.error('Error uploading passport sized photo');
                            return;
                        }
                        dialog.hideDialog();
                    }
                    );
                    }   
                });
              }else if (type === "letter") {
                findForm(formNo, (jsonData:any,error:any) => {
                    if (error || !jsonData.data) {
                        toastBar.error("Error finding form with number: '" + formNo + "'.");
                       
                    }else{
                    store.formData = jsonData.data;
                    uploadFile(formNo,type,(resp,error)=>{
                        if (error){
                            toastBar.error('Error uploading letter of admission');
                            return;
                        }
                        dialog.hideDialog();
                    }
                    );
                    }
        
  
                });
            }else if (type === "form") {
                    findForm(formNo, (jsonData:any,error:any) => {
                        if (error || !jsonData.data) {
                            toastBar.error("Error finding form with number: '" + formNo + "'.");
                           
                        }else{
                        store.formData = jsonData.data;
                        store.formNo = formNo;

                        dialog.hideDialog();
                        history.push('/formViewPage');
                        }
  
                    }); 
                }


    }
    const uploadPhotoORLetter = (type: string) => {

        setTimeout(() => {

            const { title, message, action, errorMsg } = uploadType[type];

            dialog.showDialog(title,
                <Row>
                    <Col sm={{ offset: 3, span: 6 }}>
                        Enter Your Form Number <input id="inpFormNo" className="form-control form-control-lg" type="text"
                            onChange={(e) => {
                                const formNo = e.target.value;
                                store.formNo = formNo;
                            }} placeholder="Form Number" />
                    </Col>
                </Row>,
                <Button onClick={(e) => {
                    e.preventDefault();
                    if (store.formNo) {
                        upload(type);
                        //clear formNo and the input field
                        store.formNo = '';
                        (document.getElementById("inpFormNo") as HTMLInputElement).value = '';
                    } else {
                        toastBar.error(errorMsg);
                    }
                }}>{action}</Button>)

        }, 10);

    }

    return <div style={{
        // minHeight: "100vh",  
        display: " flex",
        alignItems: "center",
        textAlign: "center"
    }}>
        <div style={{
            display: "block", marginRight: "auto", marginLeft: "auto"
        }}>
            <div style={{fontSize: 20, color: "red"}}>Deadline is {store.deadline}.</div>
            <Row>
                <Col>
                    <a href="http://www.asa-sc.org/">
                        <img src="anamlogo2.PNG" style={{width: "65%"}} alt={"asa"}/>
                    </a>
                </Col>
                <Col>
                    <a href="http://www.aswasc.org/">
                        <img src="aswalogo2.png" style={{width: "62%"}} alt={"asa"}/>
                    </a>
                </Col>

            </Row>

            <div style={{fontSize: "26px", color: "blue"}}>
                Anambra State Association of southern California <br/>
                and <br/>
                Anambra State Women Association of Southern California
            </div>
            <div style={{fontSize: 20}}>Welcome to the {store.year} Scholarship form page.</div>

            <Row className="justify-content-center mt-4 g-4" style={{ maxWidth: "800px", margin: "20px auto 0 auto" }}>
                <Col md={6} className="mb-3">
                    <Card className="h-100 shadow-sm" style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e0e0e0", textAlign: "left" }}>
                        <Card.Body className="d-flex flex-column p-4">
                            <div className="mb-2" style={{ fontSize: "2rem" }}>✍️</div>
                            <Card.Title className="fw-bold" style={{ color: "#0d6efd" }}>Start New Application</Card.Title>
                            <Card.Text className="text-muted flex-grow-1" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                                Select this option if you are applying for the first time. You will enter your basic information and receive a Form Number via email to verify your address and activate your application.
                            </Card.Text>
                            <Button className="btn btn-primary w-100 mt-3 py-2 fw-semibold" onClick={newForm} style={{ borderRadius: "8px" }}>
                                Start New Form
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={6} className="mb-3">
                    <Card className="h-100 shadow-sm" style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e0e0e0", textAlign: "left" }}>
                        <Card.Body className="d-flex flex-column p-4">
                            <div className="mb-2" style={{ fontSize: "2rem" }}>📂</div>
                            <Card.Title className="fw-bold" style={{ color: "#198754" }}>Continue / Complete Form</Card.Title>
                            <Card.Text className="text-muted flex-grow-1" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                                Select this option if you need to:
                                <ul className="mt-2 mb-0 ps-3" style={{ fontSize: "13.5px" }}>
                                    <li>Complete unfinished form entries</li>
                                    <li>Upload your <strong style={{ color: "#dc3545" }}>Letter of Admission</strong></li>
                                    <li>Upload your <strong style={{ color: "#dc3545" }}>Passport Sized Photo</strong></li>
                                    <li>Review or edit your existing details</li>
                                </ul>
                            </Card.Text>
                            <Button className="btn btn-success w-100 mt-3 py-2 fw-semibold" onClick={viewApplication} style={{ borderRadius: "8px" }}>
                                Login & Continue
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    </div>;
}
