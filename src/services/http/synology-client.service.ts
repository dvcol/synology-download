import {BaseHttpService} from "./base-http-service";
import {Observable, tap} from "rxjs";
import {HttpParameters, HttpResponse} from "../../models/http.model";
import { TaskListOption} from "../../models/task.model";
import {API, Endpoint, ListSuccess, LoginSuccess, Method, SessionName} from "../../models/synology.model";

class SynologyClientService extends BaseHttpService {
    private prefix = 'webapi';
    private sid?: string;

    setBaseUrl(baseUrl: string, prefix = this.prefix): void {
        super.setBaseUrl(baseUrl + prefix);
    }

    setSid(sid?: string): void {
        this.sid = sid;
    }

    login(account: string, passwd: string, otp_code?: string): Observable<HttpResponse<LoginSuccess>> {
        const params: HttpParameters = {
            api: API.Auth,
            version: '2',
            method: Method.login,
            session: SessionName.DownloadStation,
            format: 'sid',
            account,
            passwd
        }
        if (otp_code) params.otp_code = otp_code
        return this.get<HttpResponse<LoginSuccess>>(Endpoint.Auth, params)
            .pipe(tap(console.log), tap(({data: {sid}}) => this.setSid(sid)))
    }

    logout(): Observable<HttpResponse<unknown>> {
        return this.get(Endpoint.Auth,
            {
                api: API.Auth,
                version: '1',
                method: Method.logout,
                session: SessionName.DownloadStation,
            }).pipe(tap(console.log), tap(() => this.setSid()))
    }

    list(additional?: TaskListOption[], offset = 0, limit = -1): Observable<HttpResponse<ListSuccess>> {
        const params: HttpParameters = {
            api: API.DownloadStation,
            version: '1',
            method: Method.list
        }
        if (additional?.length) params.additional = `${additional}`
        if (offset) params.offset = `${offset}`
        if (limit) params.limit = `${limit}`
        if(this.sid) params.sid = this.sid;
        return this.get(Endpoint.DonwloadStation, params)
    }

}

export const synologyClient = new SynologyClientService();
