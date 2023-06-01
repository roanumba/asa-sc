import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {App} from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import  "./FormView.css"
import {BgSpinner} from "./ui/BgSpinner";
import {Dialog} from "./ui/Dialog";


export const BusySpinner ={
    setBusy:(busy:boolean)=>{}
}

export const StaticDialog ={
    show:(params:any)=>{},
    hide:()=>{}

}
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>

    <App />
      <BgSpinner handler={BusySpinner}/>
      <Dialog handle={StaticDialog}/>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
