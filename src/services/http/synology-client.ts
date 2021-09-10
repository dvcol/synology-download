import {BaseHttpService} from "./base-http-service";
import {Observable, of} from "rxjs";
import {Task, TaskStatus} from "../../models/task.model";
import {mockTasks} from "../mock/task.mock";

export type Drink = {
    idDrink: number,
    strDrink: string,
    strDrinkThumb: string
}

class SynologyClient extends BaseHttpService {

    search(term: string): Observable<{ drinks: Drink[] }> {
        return this.get<{ drinks: Drink[] }>(`//filter.php?i=${term}`);
    }

    getByStatus(status?: TaskStatus | TaskStatus[]): Observable<Task[]> {
        const result = mockTasks.filter((t) => status
            ? Array.isArray(status)
                ? status.map(toString).includes(t.status)
                : t.status === status.toString()
            : true)
        mockTasks.forEach(t => {
            console.log(t.status, status, !!status, Array.isArray(status), status
                ? Array.isArray(status)
                    ? status.map(toString).includes(t.status)
                    : t.status === status.toString()
                : true)
        })
        console.log(status, result)
        return of(result)
    }
}

export const synologyClient = new SynologyClient('https://www.thecocktaildb.com/api/json/v1/1');