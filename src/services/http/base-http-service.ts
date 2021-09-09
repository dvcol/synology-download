import {Observable} from "rxjs";
import {BaseHttpRequest, Body, HttpHeaders, Method} from "../../models/http.model";

/** Base Http request class implementation*/
export class BaseHttpService {

    constructor(private baseUrl: string = '') {
    }

    request<T>({url, method, headers, body}: BaseHttpRequest): Observable<T> {
        return new Observable<T>(observer => {
            // Controller for abort-able fetch request
            const controller = new AbortController();
            fetch(this.baseUrl + url, {method, headers, body, signal: controller.signal})
                .then((r: Response) => r.json())
                .then((data: T) => {
                    observer.next(data);
                    observer.complete();
                })
                .catch((e: any) => observer.error(e))
            // Abort fetch on unsubscribe
            return () => controller.abort()
        })
    };

    get<T>(url: string = '', headers: HttpHeaders = {'Access-Control-Allow-Origin': '*'}): Observable<T> {
        return this.request({url, method: Method.GET, headers});
    }

    post<T>(body: Body, url: string = '', headers: HttpHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }): Observable<T> {
        return this.request({url, method: Method.POST, headers, body});
    }

    put<T>(body: Body, url: string = '', headers: HttpHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }): Observable<T> {
        return this.request({url, method: Method.PUT, headers, body});
    }

    delete<T>(url: string = '', headers: HttpHeaders = {'Access-Control-Allow-Origin': '*'}): Observable<T> {
        return this.request({url, method: Method.DELETE, headers});
    }
}