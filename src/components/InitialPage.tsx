import {Button, Col, Row} from "react-bootstrap";
import React, {useEffect} from "react";
// import {navigateTo} from "../App";
import {useHistory} from "react-router-dom";
import {store} from "../services/storeService";
import {dialog} from "../services/DialogService";
import {clientService, get} from "../services/ServerService";
import { uploadLetterOfAdmision,uploadPassportSizedPhoto } from "./FileUpload";




export const InitialPage = () => {

    const history = useHistory();

    const [formNo, setFormNo] = React.useState<string>("");

    useEffect(() => {
        store.clearForm();
         dialog.setBusy(true);
        //  get(`/api.php?id=266`).then((d)=>{
        //      console.log(`====== ${JSON.stringify(d, null, 2)}`)
        //  }).catch((e)=>{
        //      console.error(e)
        //  })
         setTimeout(()=>{
             dialog.setBusy(false)
         },100)
    }, []);
    
/*    const dialog: DialogService;
    const server: ServerService;
    const router: Router;
    const store: StoreService;
    
    const findForm=(formNo:number, callback:(d:any)=>void)=> {
          //dialog.setBusy(true);

           const params = {method: "findFormByFormNumber", params: {formNumber: formNo}};
           $.post("server/formService.php?", JSON.stringify(params), (data, status) => {
               try {
                   const jsonData = JSON.parse(data);
                   if (jsonData.data) {
                       callback(jsonData);

                   }
                   else {
                       dialog.showErrorDialog("Form Error",
                           "No form found with number: '" + formNo + "'."
                       );

                   }
               }
               catch (ex) {
                   dialog.showErrorDialog("Form Error",
                       "Server Error please try again later."
                   );

               }
               dialog.setBusy(false);

           });
       };

     */

    // const  editForm=() =>{
    //           if (formNo) {

    //               findForm(formNo, (jsonData) => {
    //                   store.formData = jsonData.data;
    //                   store.formNo = formNo;
    //                   router.navigate(['formViewPage']);
    //               });

    //           }
    //           else {
    //               dialog.showErrorDialog("Form Error",
    //                   "'Form Number' is required to edit existing form"
    //               );

    //           }
    //       }
          
       const newForm=()=> {
           store.formData = {};
           store.formNo = '';
           history.push('/formViewPage');
       }

       const findForm=(formNo:string)=>{
            return new Promise((resolve, reject) => {
                clientService.findform(formNo, (jsonData, error) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (jsonData.data) {
                            resolve(jsonData.data);
                        }
                        else {
                            resolve(null);
                        }
                    }
                })


            })
         }

    const editForm= async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        if (formNo) {
 
            try {
                const jsonData:any= await findForm(formNo);
                if (jsonData) {
                    store.formData = jsonData;
                    store.formNo = formNo;
                    history.push("/formViewPage");
                }
                else {
                    dialog.showErrorDialog(
                        "Form Error",
                        "No form found with number: '" + formNo + "'."
                    );
                }
            } catch (error) {
                dialog.showErrorDialog(
                    "Form Error",
                    `No form found with number: '${formNo}'.`
                );                
            }


        } else {
            dialog.showErrorDialog(
                "Form Error",
                "'Form Number' is required to edit existing form"
            );
        }
    }
    const uploadPhoto=async(event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=> {

        if (formNo) {
            const data=await findForm(formNo)
            if (!data) {
                dialog.showErrorDialog(
                    "Form Error",
                    `No form found with number: '${formNo}'.`
                );
                return;
            }
            uploadPassportSizedPhoto(formNo);

        } else {
            dialog.showErrorDialog(
                "Form Error",
                "'Form Number' is required to upload passport sized photo"
            );
        }
    }
    const uploadLetter=async(event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=> {
        if (formNo) {
            const data=await findForm(formNo)
            if (!data) {
                dialog.showErrorDialog(
                    "Form Error",
                    `No form found with number: '${formNo}'.`
                );
                return;
            }
            uploadLetterOfAdmision(formNo);

        } else {
            dialog.showErrorDialog(
                "Form Error",
                "'Form Number' is required to upload admission letter"
            );
        }
    }


    return <div style={{
        minHeight: "100vh",  /*These two lines are counted as one :-)       */
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
            OR<br/>
            Edit Completed Form/Upload Admission Letter.<br/>
            <Row>
                <Col sm={{offset:4,span:4}}>
                    <input className="form-control" id="formNumber" placeholder="Form Number" onChange={(e)=>{
                        setFormNo(e.target.value);                                  
                    }} />
                </Col>
            </Row>
            <Row style={{marginTop:5}}>
                <Col sm={{span: 4}}>
                    <Button variant={"info"} size="sm" id="editForm" onClick={editForm}>
                        Edit  Completed Form
                    </Button>
                </Col>

                <Col sm={{ span: 4}}>
                    <Button variant={"success"} size="sm" id="uploadPhoto" onClick={uploadPhoto}>
                        Upload Passport sized Photo
                    </Button>
                </Col>
                <Col sm={{ span: 4}}>
                    <Button variant={"warning"} size="sm" id="uploadLetter" onClick={uploadLetter}>
                        Upload Admission Letter
                    </Button>
                </Col>

            </Row>
        </div>
    </div>;
}
