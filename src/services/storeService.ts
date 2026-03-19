import dayjs, { Dayjs } from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat';

import {  fetchWithoutToken } from "./ServerService";
import { toastBar } from "..";

// Enable localized format plugin for LL format
dayjs.extend(localizedFormat);

const LGAs={
    "Aguata":	["Achina",	"Agulezechukwu",  "Akpo",  "Amesi",  "Ekwulobia", "Ezinifite", "Igbo-Ukwu",
	        "Ikenga",	"Isuofia",	"Nkpologwu",	"Oraeri",	"Uga",	"Umuchu",	"Umuona"],
    "Anambra East":	["Aguleri",	"Enugwu Aguleri",	"Eziagulu Otu",	"Igbariam",	"Umueri"],
    "Anambra West":	["Abatete",	"Ajalli",	"Akpo",	"Alor",	"Amaku",	"Anaku",	"Atani",	"Awkuzu",	"Ezi Anaba",	"Igbakwu",	],
    "Anaocha": ["Agulu", "Aguluzigbo", "Neni", "Obeledu", "Umuona"],
    "Awka North": ["Awba Ofemili","Awba Terraces","Eziagulu Otu","Isiagu","Mgbakwu","Nibo","Nise","Ose"],
    "Awka South": ["Amikwo","Isu Aniocha","Isuofia","Lagos Road","Mgbakwu","Nkwelle Ezunaka","Okpuno","Ugbene"],
    "Ayamelum": ["Anaku", "Umueje", "Omasi", "Igbakwu", "Umumbo", "Omor", "Umuerum", "Ifite Ogwari"],
    "Dunukofia": ["Abagana","Abba","Awada","Eziagulu Otu","Ifitedunu","Ukpo"],
    "Ekwusigo": ["Ubulu uno", "Oraifite", "Ozubulu", "Ubulu uku", "Ihembosi", "Ichi", "Omambara"],
    "Idemili North": ["Abacha","Abatete","Eziowelle","Ideani","Nkpor","Obosi"],
    "Idemili South": ["Akwuoba","Alor","Amaku",],
    "Ihiala": ["Amorka",	"Isseke",	"Oba",	"Orsumoghu",	"Uli",	"Umuhu"],
    "Njikoka": ["Abagana","Abba","Awada","Eziagulu Otu","Ifitedunu","Ukpo"],
    "Nnewi North": ["Ezinifite",	"Otolo",	"Uruagu",	"Umudim"],
    "Nnewi South": ["Amanator",	"Ekwusigo",	"Umunze"],
    "Ogbaru": ["Atani", "Akili-Ogidi", "Akili-Ozizor", "Amiyi", "Mputu", "Obeagwe", 
        "Ohita", "Odekpe", "Ogbakugba", "Ochuche Umuodu", "Ossomala/Ossomari", 
        "Ogwu-aniocha", "Umunankwo", "Umuzu", "Okpoko", "Ogwu-Ikpele"],
    "Onitsha North": ["Onitsha"],
    "Onitsha South": ["Onitsha"],
    "Orumba North": ["Ndikelionwu", "Okpeze", "Nanka", "Okoh", "Omogho", "Amaetiti", "Awa", "Ndiokolo"],
    "Orumba South": ["Akpujiogu (Akpu)", "Umuomaku", "Eziagu", "Ezira", "Ihite", "Nkerehi (Umuchukwu)", 
        "Nawfija", "Ogboji", "Ogbunka", "Owerre-Ezukala", "Agbudu", "Onneh", "Isulo", "Enugwu-Umuonyia"],
    "Oyi": ["Nkwelle-Ezunaka", "Awkuzu", "Ogbunike", "Umuneba", "Umunya", "Nteje"]
}
export const lgaList=Object.keys(LGAs);
export const getTownsForLGA=(lga:string)=>{
    return LGAs[lga as keyof typeof LGAs] || [];
}
export class StoreService {
    OPENING_DATE = "2016-05-31";
    CLOSING_DATE = "2016-06-30";
    deadLineDate = dayjs();
    deadline = '';
    year = 0;
 

    formNo = '';
    prefillEmail = '';
    private _formData = [] as any[];

    async init() {
        try {
            // Use new REST API endpoint for config
            const resp:any= await fetchWithoutToken('/config');

            if (resp && resp.success && resp.data) {
                this.CLOSING_DATE = resp.data.CLOSING_DATE;
                this.OPENING_DATE = resp.data.OPENING_DATE;
            } else {
                throw new Error('Failed to load config');
            }
        } catch (error) {
            console.log(error);
            toastBar.error("Error loading config");
        } finally {
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


