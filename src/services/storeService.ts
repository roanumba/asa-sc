import moment from "moment";
import { Moment } from "moment";

import {  fetchWithoutToken } from "./ServerService";
import { toastBar } from "..";


export class StoreService {
    OPENING_DATE = "2016-05-31";
    CLOSING_DATE = "2016-06-30";
    momentDeadLineDate = moment();
    deadline = '';
    year = 0;
 

    formNo = '';
    private _formData = [] as any[];

    async init() {
        try {
            const resp:any= await fetchWithoutToken('/loadConfig.php?method=load');
            // const resp = JSON.parse(data);
            const config=resp.data;
            this.CLOSING_DATE = config.CLOSING_DATE;
            this.OPENING_DATE = config.OPENING_DATE;


        } catch (error) {
            console.log(error);
            toastBar.error("Error loading config");
        }finally{
            this.momentDeadLineDate = moment(this.CLOSING_DATE, 'YYYY-MM-DD');
            this.deadline = this.momentDeadLineDate.format('LL');
            this.year = this.momentDeadLineDate.year();
        }
    }
    //load config from server
    constructor () {

    }   

    get formData(): any[] {
        return this._formData;
    }

    set formData(value: any[]) {
        this._formData = value;
    }
    isOverDeadLine(date: Moment): boolean {
        return date.isAfter(this.momentDeadLineDate);
    }

}


