import {Button, Col, Row} from "react-bootstrap";
import React, {useEffect,useState} from "react";
// import {navigateTo} from "../App";
import {useHistory} from "react-router-dom";
import {store} from "../";
import {dialog} from "../services/DialogService";
import { findForm, get, uploadFile} from "../services/ServerService";
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

    // let formNo: any;


    useEffect(() => {
         dialog.setBusy(true);
         // Debug/test code - commented out
         // get(`/api.php?id=266`).then((d)=>{
         //     console.log(`====== ${JSON.stringify(d)}`)
         // }).catch((e)=>{
         //     console.error(e)
         // })
         setTimeout(()=>{
             dialog.setBusy(false)
         },1000)
    }, []);
    


          
       const newForm=()=> {
           store.formData = [];
           store.formNo = '';
           history.push('/formViewPage');
       }

       const viewApplication = () => {
           setTimeout(() => {
               dialog.showDialog('View Your Application',
                   <Row>
                       <Col sm={{ offset: 3, span: 6 }}>
                           Enter Your Form Number
                           <input
                               id="inpViewFormNo"
                               className="form-control form-control-lg"
                               type="text"
                               onChange={(e) => {
                                   const formNo = e.target.value.toUpperCase();
                                   store.formNo = formNo;
                               }}
                               placeholder="Form Number"
                           />
                       </Col>
                   </Row>,
                   <Button onClick={(e) => {
                       e.preventDefault();
                       if (store.formNo) {
                           const formNo = store.formNo;
                           // Navigate to preview page
                           history.push(`/preview/${formNo}`);
                           dialog.hideDialog();
                           // Clear formNo and input field
                           store.formNo = '';
                           const input = document.getElementById("inpViewFormNo") as HTMLInputElement;
                           if (input) input.value = '';
                       } else {
                           toastBar.error('Form Number is required to view application.');
                       }
                   }}>View Application</Button>
               );
           }, 10);
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

            <div style={{fontSize: 16}}>
                <Button className="btn btn-danger" onClick={newForm}> Start a new form</Button>
                {' '}
                <Button className="btn btn-primary" onClick={viewApplication}>
                    View/Continue Application
                </Button>
            </div>


        </div>
        <div style={{ textAlign: 'center', marginTop: 30, paddingBottom: 20 }}>
            <Button
                variant="link"
                size="sm"
                style={{ color: '#999', fontSize: 12 }}
                onClick={() => history.push('/admin/login')}
            >
                Admin Login
            </Button>
        </div>
    </div>;
}
