import React from "react";
import {Button,Spinner} from "react-bootstrap";
// import {navigateTo} from "../App";
import {BrowserRouter as Router, Link} from "react-router-dom";
import {Modal} from "../ui/Modal";
import {StaticDialog} from "../index";
import {dialog} from "../services/DialogService";

export const About=() =>{
    const params={
        title:"Testing" ,
        actions:<Button onClick={() => dialog.hideDialog()}>close</Button> ,
        body:<><h4>Centered Modal</h4>Testing body</>
}
  return (
    <>

        <h2>About</h2>
        <Link to="/dashboard">Dashboard</Link>{' '}
        <Link to="/">Home</Link>   {' '}


        <Button variant="primary" onClick={() => dialog.showDialog(
            params.title,params.body,params.actions
        )}>
          Static  vertically centered modal
        </Button>



    </>
  );
}


