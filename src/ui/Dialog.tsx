import React, {ReactNode, useState} from 'react';
import {Modal} from "./Modal";
import {Button} from "react-bootstrap";

interface Props {
 handle:{show:(params:any)=>void;hide:()=>void};
}

export const Dialog = (props: Props) => {
    const [modalShow, setModalShow] = useState(false);
    const [title, setTitle] = useState<ReactNode>("<Title>");
    const [actions, setActions] = useState<ReactNode>('');
    const [body, setBody] = useState<ReactNode>('');
    props.handle.show=(params:any)=>{
        setModalShow(true);
        setTitle(params.title)  ;
        setActions(params.actions)  ;
        setBody(params.body)
    }
    props.handle.hide=()=>{
        setModalShow(false)
    }
    return <>
        <Modal
            title={title}
          show={modalShow}
          onHide={() => setModalShow(false)}
          actions={actions}
        >
            {body}
        </Modal>
    </>
};


