import {BaseHttpService} from "./base-http-service";
import {Observable, of} from "rxjs";
import {Task, TaskStatus} from "../../models/task.model";
import {mockTasks} from "../mock/task.mock";

export type Drink = {
    idDrink: number,
    strDrink: string,
    strDrinkThumb: string
}

// TODO: Remove Mock
class SynologyClient extends BaseHttpService {

    search(term: string): Observable<{ drinks: Drink[] }> {
        return this.get<{ drinks: Drink[] }>(`//filter.php?i=${term}`);
    }

    getByStatus(status?: TaskStatus | TaskStatus[]): Observable<Task[]> {
        const result = mockTasks.filter((t) => status
            ? Array.isArray(status)
                ? status.includes(t.status)
                : t.status === status
            : true)
        return of(result)
    }
}

export const synologyClient = new SynologyClient('https://www.thecocktaildb.com/api/json/v1/1');
