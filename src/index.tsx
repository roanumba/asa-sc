import React from 'react';
import ReactDOM from 'react-dom/client';

// Dynamically configure <base> tag to match current folder URL path
const getDynamicBasePath = () => {
    let path = window.location.pathname;
    // Remove filename like index.html if present
    path = path.replace(/\/index\.html$/, '');
    // Ensure it ends with a slash
    if (!path.endsWith('/')) {
        path += '/';
    }
    return path;
};

let baseTag = document.querySelector('base');
if (!baseTag) {
    const base = getDynamicBasePath();
    baseTag = document.createElement('base');
    baseTag.setAttribute('href', base);
    document.head.appendChild(baseTag);
}

import './index.css';
import {App} from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import  "./FormView.css"
import {BgSpinner} from "./ui/BgSpinner";
import {Dialog} from "./ui/Dialog";
import { ToastBar } from './ui/ToastBar';
import { StoreService } from './services/storeService';


export const BusySpinner ={
    setBusy:(busy:boolean)=>{}
}

export const StaticDialog ={
    show:(params:any)=>{},
    hide:()=>{}

}

const ToastHandler ={
  setMessage:(type:number,message:string)=>{}
} 

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
export const toastBar={
  success:(message:string)=>{
    ToastHandler.setMessage(1,message)
  },
  error:(message:string)=>{
    ToastHandler.setMessage(2,message)
  },
  info:(message:string)=>{
    ToastHandler.setMessage(3,message)
  },
  warning:(message:string)=>{
    ToastHandler.setMessage(4,message)
  },



}

export const store = new StoreService();


root.render(
  <React.StrictMode>

      <BgSpinner handler={BusySpinner}/>
      <Dialog handle={StaticDialog}/>
      <ToastBar  handler={ToastHandler}/>
      <App />

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

