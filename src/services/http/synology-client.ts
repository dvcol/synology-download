import {BaseHttpService} from "./base-http-service";
import {Observable} from "rxjs";

export type Drink = {
    idDrink: number,
    strDrink: string,
    strDrinkThumb: string
}

class SynologyClient extends BaseHttpService {

    search(term: string): Observable<{ drinks: Drink[] }> {
        return this.get<{ drinks: Drink[] }>(`//filter.php?i=${term}`);
    }
}

export const synologyClient = new SynologyClient('https://www.thecocktaildb.com/api/json/v1/1');