import dayjs, { Dayjs } from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat';

import {  fetchWithoutToken } from "./ServerService";
import { toastBar } from "..";

// Enable localized format plugin for LL format
dayjs.extend(localizedFormat);


export class StoreService {
    OPENING_DATE = "2016-05-31";
    CLOSING_DATE = "2016-06-30";
    deadLineDate = dayjs();
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
            this.deadLineDate = dayjs(this.CLOSING_DATE, 'YYYY-MM-DD');
            this.deadline = this.deadLineDate.format('LL');
            this.year = this.deadLineDate.year();
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
    isOverDeadLine(date: Dayjs): boolean {
        return date.isAfter(this.deadLineDate);
    }

}


