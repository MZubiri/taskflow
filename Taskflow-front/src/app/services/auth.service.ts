import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
}

export interface DecodedToken {
  sub: string;
  idUsuario: number;
  rol: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  registrar(username: string, password: string, rol: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/register`, 
      { username, password, rol }, 
      { responseType: 'text' }
    );
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res: LoginResponse) => {
          if (res && res.token) {
            localStorage.setItem('taskflow_token', res.token);
            localStorage.setItem('taskflow_user', res.username);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('taskflow_token');
  }

  obtenerDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  obtenerUsuarioId(): number | null {
    const decoded = this.obtenerDecodedToken();
    return decoded ? decoded.idUsuario : null;
  }

  obtenerRol(): string | null {
    const decoded = this.obtenerDecodedToken();
    return decoded ? decoded.rol : null;
  }

  obtenerUsername(): string | null {
    const decoded = this.obtenerDecodedToken();
    return decoded ? decoded.sub : null;
  }

  isLoggedIn(): boolean {
    const decoded = this.obtenerDecodedToken();
    if (!decoded) return false;
    // Comprobar expiración del token
    const ahora = Math.floor(Date.now() / 1000);
    return decoded.exp > ahora;
  }
}
