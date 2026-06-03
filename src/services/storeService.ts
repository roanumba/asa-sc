import dayjs, { Dayjs } from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { fetchWithoutToken } from "./ServerService";
import { logger } from "../utils/logger";
import { toastBar } from "..";

// Enable localized format plugin for LL format
dayjs.extend(localizedFormat);

const LGAs={
    "Aguata":       ["Achina", "Aguluezechukwu", "Akpo", "Amesi", "Ekwulobia", "Ezinifite", "Igbo-Ukwu",
                    "Ikenga", "Isuofia", "Nkpologwu", "Oraeri", "Uga", "Umuchu", "Umuona"],
    "Anambra East": ["Aguleri", "Enugwu Aguleri", "Eziagulu Otu", "Igbariam", "Nando", "Nsugbe", "Otuocha", "Umueri"],
    "Anambra West": ["Ezi-Anam", "Ifite-Anam", "Nzam", "Olumbanasa", "Oroma-Etiti", "Umueze-Anam"],
    "Anaocha":      ["Adazi-Ani", "Adazi-Enu", "Adazi-Nnukwu", "Agulu", "Aguluzigbo", "Akwaeze", "Ichida", "Neni", "Nri", "Obeledu"],
    "Awka North":   ["Achalla", "Amansea", "Amanuke", "Awba Ofemili", "Ebenebe", "Isu-Aniocha", "Mgbakwu", "Ugbenu", "Ugbene", "Urum"],
    "Awka South":   ["Amawbia", "Awka", "Ezinato", "Isiagu", "Mbaukwu", "Nibo", "Nise", "Okpuno", "Umuawulu"],
    "Ayamelum":     ["Anaku", "Ifite Ogwari", "Igbakwu", "Omasi", "Omor", "Umumbo", "Umuerum", "Umueje"],
    "Dunukofia":    ["Ifitedunu", "Nawgu", "Ukpo", "Ukwulu", "Umudioka", "Umunachi"],
    "Ekwusigo":     ["Ichi", "Ihembosi", "Omambara", "Oraifite", "Ozubulu", "Ubulu Uno", "Ubulu Uku"],
    "Idemili North":["Abacha", "Abatete", "Eziowelle", "Ideani", "Nkpor", "Obosi", "Ogidi", "Oraukwu", "Uke", "Umuoji"],
    "Idemili South":["Akwu-Ukwu", "Alor", "Awka-Etiti", "Nnobi", "Nnokwa", "Oba", "Ojoto"],
    "Ihiala":       ["Amorka", "Azia", "Ihiala", "Isseke", "Lilu", "Mbosi", "Okija", "Orsumoghu", "Ubuluisiuzor", "Uli"],
    "Njikoka":      ["Abagana", "Abba", "Enugwu-Agidi", "Enugwu-Ukwu", "Nawfia", "Nimo"],
    "Nnewi North":  ["Nnewichi", "Otolo", "Umudim", "Uruagu"],
    "Nnewi South":  ["Akwaihedi", "Amichi", "Azigbo", "Ebenator", "Ekwulumili", "Ezinifite", "Osumenyi", "Ukpor", "Unubi", "Utuh"],
    "Ogbaru":       ["Akili-Ogidi", "Akili-Ozizor", "Amiyi", "Atani", "Mputu", "Obeagwe",
                    "Ochuche Umuodu", "Odekpe", "Ogbakugba", "Ogwu-Ikpele", "Ogwu-Aniocha",
                    "Ohita", "Okpoko", "Ossomala", "Umunankwo", "Umuzu"],
    "Onitsha North":["Onitsha"],
    "Onitsha South":["Awada", "Fegge", "Onitsha", "Woliwo"],
    "Orumba North": ["Ajalli", "Amaetiti", "Amaokpala", "Awa", "Awgbu", "Nanka", "Ndikelionwu",
                    "Ndiokolo", "Ndiowu", "Okoh", "Okpeze", "Omogho", "Ufuma"],
    "Orumba South": ["Agbudu", "Akpujiogu (Akpu)", "Enugwu-Umuonyia", "Eziagu", "Ezira", "Ihite",
                    "Isulo", "Nawfija", "Nkerehi (Umuchukwu)", "Ogboji", "Ogbunka",
                    "Onneh", "Owerre-Ezukala", "Umunze", "Umuomaku"],
    "Oyi":          ["Awkuzu", "Nteje", "Nkwelle-Ezunaka", "Ogbunike", "Umuneba", "Umunya"]
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
    hasInitialized = false;


    formNo = '';
    prefillEmail = '';
    private _formData = [] as any[];

    async init() {
        if (this.hasInitialized) {
            return;
        }
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
            logger.error(error);
            toastBar.error("Error loading config");
        } finally {
            this.deadLineDate = dayjs(this.CLOSING_DATE, 'YYYY-MM-DD');
            this.deadline = this.deadLineDate.format('LL');
            this.year = this.deadLineDate.year();
            this.hasInitialized = true;
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


