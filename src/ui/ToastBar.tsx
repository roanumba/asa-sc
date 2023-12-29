import React, { useState } from 'react';
import { ToastContainer } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import { Header } from 'react-bootstrap/lib/Modal';

interface Props {

  handler:{
    title:React.ReactNode;
    body:React.ReactNode;
    setVisible:(tf:boolean)=>void
  };
}
export const ToastBar=(props:Props)=> {
  const [show, setShow] = useState(true);

  props.handler.setVisible=setShow;                     

  const Header=<>
          <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
        <strong className="me-auto">Bootstrap</strong>
        {/* <small>11 mins ago</small> */}
        </>
  const Body=<>
  Hello, world! This is a toast message.
  </>

  return (
    <ToastContainer className="p-3" position='top-center' style={{zIndex:1}}>
    <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
      <Toast.Header>
        {Header}
      </Toast.Header>
      <Toast.Body>{Body}</Toast.Body>
    </Toast>
  </ToastContainer>
  );
}

