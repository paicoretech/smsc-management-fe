import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ConnectionService } from '@core/index';

const URL = environment.APIUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public token: any = null;
  public identity: any = '';
  public user_id: any = null;
  public roles: any[] = [];
  public headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private router: Router,
    private connectionService: ConnectionService
  ) {
  }

  getAuthToken():string {
    return localStorage.getItem('accessToken') || '';
  }

  getSenderId(): string | null {
    return localStorage.getItem('senderId');
  }

  getSenderIds(): string[] {
    const raw = localStorage.getItem('senderIds');
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string') : [];
    } catch {
      return [];
    }
  }

  signup(user: any): Promise<any> {
    const params = JSON.stringify(user);

    return this.connectionService.send(`auth/authenticate`, 'post', params);
  }

  async getIdentity()
  {
    let value = localStorage.getItem('userName');
    let identity = (value != null) ? value : '';
    if(identity && identity != "undefined")
      this.identity = identity;
    else
      this.identity = null;

    return this.identity;
  }

  async getUserId() {
    let value = localStorage.getItem('userId');
    let userId = (value != null) ? Number(value) : null;
    if (userId && !isNaN(userId))
      this.user_id = userId;
    else
      this.user_id = null;

    return this.user_id;
  }

  async getToken()
  {
    let token = localStorage.getItem('accessToken');
    if(token != "undefined")
    {
      this.token = token;
    }
    else{
        this.token = null;
    }
      return this.token;
  }

  async getRoles()
  {
    let roles = localStorage.getItem('roles');
    if(roles != "undefined") {
      this.roles = JSON.parse(roles || '[]');
    } else{
      this.roles = [];
    }

    return this.roles;
  }

  async validateToken(): Promise<boolean>
  {
    this.getToken();
    if ( !this.token && this.token != '')
    {
      this.router.navigate(['/auth/login']);
      return Promise.resolve(false);
    }

    return new Promise<boolean>(async resolve => {

      this.getIdentity();
      if ( this.identity && this.identity != '' )
      {
        resolve( true );
      }
      else
      {
        resolve( false );
        this.router.navigate(['/auth/login']);
      }
    });
  }

  async changePassword(user: any, must_change_password: boolean): Promise<any>
  {
    const params = JSON.stringify(user);
    return this.connectionService.send(`auth/reset-passwd/${ must_change_password }`, 'put', params);
  }

  async logout()
  {
    await this.connectionService.send(`auth/logout`, 'post', {});
    this.token = null;
    this.identity = null;
    this.user_id = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('identity');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('senderIds');
    this.router.navigateByUrl('/auth/login');
  }

}
