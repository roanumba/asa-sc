import {ReactNode} from "react";
import {BusySpinner, StaticDialog} from "../index";

class DialogService {

    setBusy(tf:boolean) {
         BusySpinner.setBusy(tf)
    };
    constructor() {
    }
    hideDialog(){
        StaticDialog.hide()
    }
    showDialog(title:ReactNode, message:ReactNode, buttons:ReactNode) {
        let params = {
            title: title,
            body: message,
            actions:buttons

        }

        return StaticDialog.show(params);
    };

    showErrorDialog(title:ReactNode, message:ReactNode,buttons:ReactNode=null) {
        return this.showDialog(title, message, buttons);
    }
}

const dialog=new DialogService();
export {dialog}
