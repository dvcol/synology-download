import {BaseHttpService} from "./base-http-service";
import {Observable, tap} from "rxjs";
import {HttpParameters, HttpResponse} from "../../models/http.model";
import {TaskListOption} from "../../models/task.model";
import {
    API,
    CommonResponse,
    Endpoint,
    ListResponse,
    LoginResponse,
    Method,
    SessionName
} from "../../models/synology.model";

class SynologyClientService extends BaseHttpService {
    private prefix = 'webapi';
    private sid?: string;

    setBaseUrl(baseUrl: string, prefix = this.prefix): void {
        super.setBaseUrl(baseUrl + prefix);
    }

    setSid(sid?: string): void {
        this.sid = sid;
    }

    login(account: string, passwd: string, otp_code?: string): Observable<HttpResponse<LoginResponse>> {
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
        return this.get<HttpResponse<LoginResponse>>(Endpoint.Auth, params)
            .pipe(tap(console.log), tap(({data: {sid}}) => this.setSid(sid)))
    }

    logout(): Observable<HttpResponse<void>> {
        return this.get<HttpResponse<void>>(Endpoint.Auth,
            {
                api: API.Auth,
                version: '1',
                method: Method.logout,
                session: SessionName.DownloadStation,
            }).pipe(tap(console.log), tap(() => this.setSid()))
    }

    commonTaskGet<T>(params: HttpParameters): Observable<HttpResponse<T>> {
        if (this.sid) params.sid = this.sid;
        return this.get<HttpResponse<T>>(Endpoint.DonwloadStation, {api: API.DownloadStation, version: '1', ...params})
    }

    listTasks(additional: TaskListOption[] = [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer], offset = 0, limit = -1): Observable<HttpResponse<ListResponse>> {
        const params: HttpParameters = {method: Method.list}
        if (additional?.length) params.additional = `${additional}`
        if (offset) params.offset = `${offset}`
        if (limit) params.limit = `${limit}`
        return this.commonTaskGet<ListResponse>(params)
    }

    createTask(uri: string, destination?: string, username?: string, password?: string, unzip?: string) {
        const params: HttpParameters = {method: Method.create, uri}
        if (destination) params.destination = destination
        if (username) params.username = username
        if (password) params.password = password
        if (unzip) params.unzip = unzip
        return this.commonTaskGet<void>(params)
    }

    deleteTask(id: string | string[], force = false): Observable<HttpResponse<CommonResponse[]>> {
        return this.commonTaskGet<CommonResponse[]>({method: Method.delete, id, "force_complete": `${force}`})
    }

    pauseTask(id: string | string[]): Observable<HttpResponse<CommonResponse[]>> {
        return this.commonTaskGet<CommonResponse[]>({method: Method.pause, id})
    }

    resumeTask(id: string | string[]): Observable<HttpResponse<CommonResponse[]>> {
        return this.commonTaskGet<CommonResponse[]>({method: Method.resume, id})
    }

    editTask(id: string | string[], destination: string): Observable<HttpResponse<CommonResponse[]>> {
        return this.commonTaskGet<CommonResponse[]>({method: Method.edit, id, destination})
    }

}

export const synologyClient = new SynologyClientService();
