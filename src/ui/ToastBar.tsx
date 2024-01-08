import React, { useState } from 'react';
import { ToastContainer } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import { Header } from 'react-bootstrap/lib/Modal';

interface Props {

  handler:{
    setMessage:(type:number,message:string)=>void;
  };
}
export const ToastBar = (props: Props) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');


  props.handler.setMessage = (type: number, message: string) => {
    let strType='Success'
    switch (type) {

      case 2:
        strType = "Error";
        break;
      case 3:
        strType = "Info";
        break;
      case 4:
        strType = "Warning";
        break;
    }
    setTitle(strType);
    setMessage(message);
    setShow(true);
  }




  return (
    <ToastContainer  position='top-center' style={{zIndex:1070}}>
    <Toast 
    onClose={() => { setShow(false) }} 
    // className="d-inline-block m-1"
    show={show} 
    bg={title==="Error"?"danger":title.toLowerCase()}
    // delay={3000} 
    autohide
    style={{width:'auto',minWidth:'150px'}}
    >
      <Toast.Header className={`text-${title==="Error"?"danger":title==="Success"?"success":"dark"}`}>
      <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto text-denger">{title}</strong>        
        
      </Toast.Header>
      <Toast.Body className={(title==="Error" ||title==='Success') ? 'text-white':""}>
        {message}
        </Toast.Body>
    </Toast>
  </ToastContainer>
  );
}

