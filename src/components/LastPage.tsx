import React, { useEffect, useState } from "react";
import { store } from "../";
import { useHistory } from "react-router-dom";
import { loadLastForm } from "../services/ServerService";
import { dialog } from "../services/DialogService";
import { toastBar } from "..";

//create react funtion component naled LastPage.tsx
/* const dataRows = [
    {key: "Form Number", value: "Gj 1234"},
    {key: "First Name", value: "Manuel"},
    {key: "Last Name", value: "Gomez"},
    {key: "Middle Name", value: "Gomez"},
    {key: "Date of Birth", value: "10/10/2020"},

]; */
export const LastPage = () => {
    const history = useHistory();

    const [dataRows, setDataRows] = useState([]);

    const onInit = () => {
        const formNo = store.formNo;

        const reqData = {
            formNumber: store.formNo,
            year: store.year,
            deadline: store.CLOSING_DATE
        };
        loadLastForm(reqData, (data, status) => {

            let idx = data.indexOf('<<==>>');
            data = data.substring(idx + 6);
            let jsonData = JSON.parse(data);
            const noAdmissionLetter = jsonData.noAdmissionLetter;
            const noPassportPhoto = jsonData.noPassportPhoto;
            const dataRows = jsonData.dataRows;
            const mailError = jsonData.mailError;
            if (mailError) {
                toastBar.error("Error: " + mailError);
            }
            setDataRows(dataRows);
            let msg = "";
            if (noAdmissionLetter && noPassportPhoto) {
                msg = `You have not uploaded your <b>admission letter</b> and <b>passport photo</b>.`
            }
            else if (noAdmissionLetter) {
                msg = `You have not uploaded your <b>admission letter</b>.`

            }
            else if (noPassportPhoto) {
                msg = `You have not uploaded your <b>passport photo</b>.`

            }
            if (msg) {
                msg += ` Please go back to <br/>
                        <a href="index.html">${store.year} ASA-SC & ASWA-SC Scholarship form </a> <br/>
                        whenever they are available, and use your form number <b>${formNo}</b> to upload them by ${store.deadline}.`
                dialog.showErrorDialog("Upload Error",<>{msg}</>);
            }

        });
    }
    useEffect(() => {
        onInit();
    }
        , []);
    const closeView = () => {
        history.push('/');
    }


    return <form id={'form'}>
        <button id="closeView" className="btn btn-danger float-end btn-sm" title="Close" style={{ margin: 30 }} onClick={closeView}>X</button>

        <div className="" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <br />
            <div className="panel panel-primary">
                <div className="panel-heading">
                    <img className="row float-start" src="anamlogo2.PNG" style={{ width: "8%", height: "8%", color: "white" }} />
                    <img className="row float-end" src="aswalogo2.png" style={{ width: "8%", height: "8%", color: "white" }} />
                    <div className="panel-title" style={{ fontSize: 14, textAlign: "center" }}>
                        Anambra State Association of southern California <br />
                        and <br />
                        Anambra State Women Association of Southern California
                    </div>
                </div>
                <div className="label-warning" style={{ textAlign: "center", fontSize: 19, marginTop: 1 }}>
                    {store.year} Scholarship Form
                </div>
                <div className="panel-body">
                    {dataRows.map((row: any) => <div className="row" >
                        <div className="asa-label col-sm-3">
                            {row.key}:
                        </div>
                        <div className="col-sm-8"
                            style={{
                                background: "#eee",
                                marginBottom: "2px",
                                borderRadius: "4px",
                                padding: "5px"
                            }}>
                            {row.value}
                        </div>
                    </div>)}

                </div>

            </div>
        </div>
    </form>

}

// Path: src/components/Modal.tsx
