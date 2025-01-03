import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class CommonService {

    private _adminHeaders = new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });

    constructor(public http: HttpClient) {
    }

    public getAdminHeaders(): HttpHeaders {
        if (window.localStorage.getItem('token')) {
            this._adminHeaders = new HttpHeaders(
                {
                    'Authorization': 'Bearer ' + window.localStorage.getItem('token'),
                    // 'id_token': 'Bearer ' + window.localStorage.getItem('id_token'),
                });
        } else {
            this._adminHeaders = new HttpHeaders({
                Accept: 'application/json',
                'Content-Type': 'application/json',
            });
        }
        return this._adminHeaders;
    }

    get(url: string, params?: any): Observable<any> {
        let queryStr = '';
        if (params) {
            Object.keys(params).forEach(key => {
                if (!params[key]) {
                    delete params[key];
                }
            });
            const httpParams = new HttpParams({
                fromObject: params
            });
            queryStr = httpParams.toString();
        }
        return this.http.get<any>(environment.host + url + (queryStr
            ? '?' + queryStr : ''),
            { headers: this.getAdminHeaders() })
            .pipe(
                map(response => response),
                catchError(error => {
                    return throwError(error);
                })
            );
    }

    getById(url: string, id: any): Observable<any> {
        return this.http.get<any>(environment.host + url + id, { headers: this.getAdminHeaders() })
            .pipe(
                map(response => response),
                catchError(error => {
                    return throwError(error);
                })
            );
    }

    post(url: string, data: any, isLogin?: boolean): Observable<any> {
        // let headers: any;
        // if (isLogin) {
        //     headers = new HttpHeaders({ 'Authorization': 'Bearer ' + window.localStorage.getItem('id_token') });
        // } else {
        //     headers = this.getAdminHeaders();
        // }

        return this.http.post<any>(environment.host + url, data, { headers: this.getAdminHeaders() })
            .pipe(
                map(response => response),
                catchError(error => {
                    return throwError(error);
                })
            );
    }

    postWithFormData(url: string, data?: FormData): Observable<any> {
        const userHeaders = _.clone(this._adminHeaders);
        delete userHeaders['Content-Type'];
        const hdrs = new HttpHeaders({
            'Authorization': 'Bearer ' + window.localStorage.getItem('access_token'),
            'id_token': 'Bearer ' + window.localStorage.getItem('id_token')
        });
        return this.http.post<any>(environment.host + url, data, { headers: hdrs })
            .pipe(
                map(response => response),
                catchError(error => {
                    return throwError(error);
                })
            );
    }

    put(url: string, data?: any, id?: any): Observable<any> {
        if (typeof data === 'object' && data.id) {
            delete data.id;
        }

        if (id) {
            return this.http.put<any>(environment.host + url + '/' + id, data, { headers: this.getAdminHeaders() })
                .pipe(
                    map(response => response),
                    catchError(error => {
                        return throwError(error);
                    })
                );
        } else {
            return this.http.put<any>(environment.host + url, data, { headers: this.getAdminHeaders() })
                .pipe(
                    map(response => response),
                    catchError(error => {
                        return throwError(error);
                    })
                );
        }
    }

    putWithFormData(url: string, data?: FormData): Observable<any> {
        const userHeaders = _.clone(this._adminHeaders);
        userHeaders.delete('Content-Type');
        return this.http.put<any>(environment.host + url, data, { headers: userHeaders })
            .pipe(
                map(response => response),
                catchError(error => {
                    return throwError(error);
                })
            );
    }

    putWithProgress(url: string, data?: FormData) {
        const userHeaders = _.clone(this._adminHeaders);
        userHeaders.delete('Content-Type');
        return this.http.put(environment.host + url, data, {
            headers: userHeaders,
            observe: 'events',
            reportProgress: true,
        });
    }

    postWithProgress(url: string, data?: FormData) {
        const userHeaders = _.clone(this._adminHeaders);
        userHeaders.delete('Content-Type');
        return this.http.post(environment.host + url, data, {
            headers: userHeaders,
            observe: 'events',
            reportProgress: true,
        });
    }

    delete(url: string): Observable<object> {
        return this.http.delete<any>(environment.host + url, { headers: this.getAdminHeaders() })
            .pipe(
                map(response => response),
                catchError(error => {
                    return throwError(error);
                })
            );
    }
}
