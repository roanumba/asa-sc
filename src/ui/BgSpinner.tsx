import React, {useState} from 'react';
import {Spinner} from "react-bootstrap";
interface Props {
    handler:{setBusy:(busy:boolean)=>void ;}
}
export const BgSpinner = (props:Props) => {
    const [busy, setBusy] = useState(false);

    props.handler.setBusy=(tf:boolean) =>{
        setBusy(tf)  ;
    }
    
    return <div>
       {busy && <>
            <div style={{
                top: 0,
                left: 0,
                // filter: "blur(4px)",
                background: "gray",
                position: "absolute",
                opacity: 0.4,
                width: "100%",
                height: "100%",
                zIndex: 1060
            }}/>
            <Spinner animation="border"
                     style={{
                         position: "absolute",
                         left: "50%",
                         top: "50%",
                         marginLeft: "-4em",
                         marginTop: "-4em",
                         zIndex: 1060
                    }}
            />
            </>}
    </div>;
}

