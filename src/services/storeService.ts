import moment from "moment";
import {Moment} from "moment";

export class StoreService {
    dateline = '2022-6-11';
    momentDeadLineDate:Moment=moment(this.dateline,'YYYY-MM-DD');
    deadline = this.momentDeadLineDate.format('LL');
    year=this.momentDeadLineDate.year();
    formNo='';
    private _formData = {} as any;

    get formData(): any {
        return this._formData;
    }

    set formData(value: any) {
        this._formData = value;
    }
    isOverDeadLine= (date:Moment):boolean=>{
         return date.isAfter(this.momentDeadLineDate);
    }
    isBeforeDeadLine= (date:Moment):boolean=>{
        return date.isBefore(this.momentDeadLineDate);
    }
    clearForm=()=>{
        this.formNo='';
        this.formData={};
    }
    isFormEmpty=()=>{
        return Object.keys(this.formData).length === 0;
    }


  constructor() { }

}

const store=new StoreService();

export {store}
