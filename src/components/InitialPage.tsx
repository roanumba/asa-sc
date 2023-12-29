import {Button, Col, Row} from "react-bootstrap";
import React, {useEffect} from "react";
// import {navigateTo} from "../App";
import {useHistory} from "react-router-dom";
import {store} from "../services/storeService";
import {dialog} from "../services/DialogService";
import { get} from "../services/ServerService";




export const InitialPage = () => {

    const history = useHistory();

    let formNo: any;

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

/*     const  editForm=() =>{
              if (formNo) {

                  findForm(formNo, (jsonData) => {
                      store.formData = jsonData.data;
                      store.formNo = formNo;
                      router.navigate(['formViewPage']);
                  });

              }
              else {
                  dialog.showErrorDialog("Form Error",
                      "'Form Number' is required to edit existing form"
                  );

              }
          } */
          
       const newForm=()=> {
           store.formData = [];
           store.formNo = '';
           history.push('/formViewPage');
       }

 /*      const uploadLetter=()=> {
           if (formNo) {
               findForm(formNo, () => {
                   server.uploadFile(formNo,'letter');
                   formNo='';
               });
           }
           else {
               dialog.showErrorDialog("Form Error",
                   "'Form Number' is required to upload letter of admission."
               );

           }
       }

       const uploadPhoto=()=> {
           if (formNo) {
               findForm(formNo, () => {
                   server.uploadFile(formNo,'passport');
                   formNo='';
               });
           }
           else {
               dialog.showErrorDialog("Form Error",
                   "'Form Number' is required to upload passport sized photo."
               );

           }
       }*/

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
                    <input className="form-control" id="formNumber" placeholder="Form Number"
                    />
                </Col>
            </Row>
            <Row style={{marginTop:5}}>
                <Col sm={{span: 4}}>
                    <Button variant={"info"} size="sm" id="editForm">
                        Edit  Completed Form
                    </Button>
                </Col>

                <Col sm={{ span: 4}}>
                    <Button variant={"success"} size="sm" id="uploadPhoto">
                        Upload Passport sized Photo
                    </Button>
                </Col>
                <Col sm={{ span: 4}}>
                    <Button variant={"warning"} size="sm" id="uploadLetter">
                        Upload Admission Letter
                    </Button>
                </Col>

            </Row>
        </div>
    </div>;
}
