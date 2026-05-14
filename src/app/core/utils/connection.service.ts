import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResponseI } from '../interfaces/Response';
import { IBaseRequest } from '../services/http/requests/base.request';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private apiUrl: string = environment.APIUrl;

  constructor(private http: HttpClient) { }

  send(path: string, type: string, ...params: any[]): Promise<ResponseI> {
    const url = `${this.apiUrl}/${path}`;
    let request: any;
    let headers = new HttpHeaders();

    if (params[0] && !(params[0] instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    switch (type) {
      case 'get':
        request = this.http.get<any>(url);
        break;
      case 'post':
      case 'upload':
        request = this.http.post<any>(url, params[0], { headers });
        break;
      case 'put':
        request = this.http.put<any>(url, params[0], { headers });  
        break;
      case 'delete':
        request = this.http.delete<any>(url);
        break;
      default:
        request = this.http.get<any>(url);
        break;
    }

    return request.toPromise()
      .catch((error: HttpErrorResponse) => {
        let resp: ResponseI = {
          status: 400,
          message: error.error?.message || 'Something went wrong',
          comment: error.error?.comment || 'Please try again later',
          data: null
        };
        return resp;
      });
  }

  post(path: string, req: IBaseRequest): Promise<ResponseI> {
    return this.send(path, 'post', req.toJson());
  }

  put(path: string, req: IBaseRequest): Promise<ResponseI> {
    return this.send(path, 'put', req.toJson());
  }

  downloadFile(path: string): void {
    const url = `${this.apiUrl}/${path}`;
    window.open(url, '_blank');
  }
}
