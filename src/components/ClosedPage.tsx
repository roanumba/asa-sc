import React from "react";
import { store } from "../";
import { Col, Row } from "react-bootstrap";

export const ClosedPage=()=>{
    
return  <div style={{
    // minHeight: "100vh",  
    display: " flex",
    alignItems: "center",
    textAlign: "center"
}}>
    <div style={{
        display: "block", marginRight: "auto", marginLeft: "auto", paddingTop: "50px"
    }}>
        <div style={{fontSize: 30}}>Welcome to the {store.year} Scholarship form page.</div>
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
<br /><br />
       
        <div style={{fontSize: 40, color: "red"}}>The acceptance of application forms has closed.</div>

       


    </div>
</div>;
}