
import React, {ReactNode} from 'react';

import {Button,Modal as BsModal} from 'react-bootstrap';

const {Footer,Header,Body,Title,}=BsModal;
interface Props {
  show:boolean;
  onHide:()=>void;
  children:ReactNode;
  actions?:ReactNode;
  title?:ReactNode;
}

export const Modal = (props:Props) => {

  const Actions=()=>{
    return  props.actions?<>{props.actions}</>:<Button onClick={props.onHide}>Close</Button>;
  } ;

  return (
    <BsModal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop={'static'}
    >
      <Header closeButton>
        <Title id="contained-modal-title-vcenter">
          {props.title?<>{props.title}</>:<>Modal heading</>}
        </Title>
      </Header>
      <Body>
        {props.children}
      </Body>
      <Footer>
            <Actions/>
      </Footer>
    </BsModal>
  );
}



