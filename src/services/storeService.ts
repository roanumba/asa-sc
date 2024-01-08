import moment from "moment";
import {Moment} from "moment";

export class StoreService {
    dateline = '2024-01-11';
    momentDeadLineDate:Moment=moment(this.dateline,'YYYY-MM-DD');
    deadline = this.momentDeadLineDate.format('LL');
    year=this.momentDeadLineDate.year();
    formNo='';
    private _formData = [] as any[];

    get formData(): any[] {
        return this._formData;
    }

    set formData(value: any[]) {
        this._formData = value;
    }
    isOverDeadLine (date:Moment):boolean{
         return date.isAfter(this.momentDeadLineDate);
    }


  constructor() { }

}

const store=new StoreService();

export {store}
