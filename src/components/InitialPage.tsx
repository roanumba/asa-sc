import {Button, Col, Row} from "react-bootstrap";
import React, {useEffect,useState} from "react";
// import {navigateTo} from "../App";
import {useHistory} from "react-router-dom";
import {store} from "../services/storeService";
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
         get(`/api.php?id=266`).then((d)=>{
             console.log(`====== ${JSON.stringify(d)}`)
         }).catch((e)=>{
             console.error(e)
         })
         setTimeout(()=>{
             dialog.setBusy(false)
         },1000)
    }, []);
    


          
       const newForm=()=> {
           store.formData = [];
           store.formNo = '';
           history.push('/formViewPage');
       }

       const upload = (type:string) => {
   
            const formNo=store.formNo;
            if (type === "passport") {
                findForm(formNo, (jsonData:any,error:any) => {
                    if (error) {
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
                    if (error) {
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
                        if (error) {
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
            </div>
            <hr/>
            <div style={{fontSize: 18}}>
                If you have already complted a form, you can <b>edit</b> it, OR <b>upload</b> your passport sized photo OR letter of admission.
            </div>
            <Row style={{marginTop:15}}>
                <Col sm={{span: 4}}>
                    <Button variant={"info"} size="sm" id="editForm" onClick={(e)=>{
                        e.preventDefault();
                        uploadPhotoORLetter("form")
                    }}>
                        Edit  Completed Form
                    </Button>
                </Col>

                <Col sm={{ span: 4}}>
                    <Button variant={"success"} size="sm" id="uploadPhoto" onClick={(e)=>{
                        e.preventDefault();
                        uploadPhotoORLetter("passport")}}>
                        Upload Passport sized Photo
                    </Button>
                </Col>
                <Col sm={{ span: 4}}>
                    <Button variant={"warning"} size="sm" id="uploadLetter" onClick={(e)=>{
                        e.preventDefault();
                        uploadPhotoORLetter("letter")}}>
                        Upload Admission Letter
                    </Button>
                </Col>

            </Row>


        </div>
    </div>;
}
