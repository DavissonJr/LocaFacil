import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterEmpresaRequest } from '../models/auth.model';

const STORAGE_KEY = 'locacao_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  usuario = signal<AuthResponse | null>(this.recuperarSessao());

  constructor(private http: HttpClient) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, req)
      .pipe(tap(res => this.salvarSessao(res)));
  }

  registrarEmpresa(req: RegisterEmpresaRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/registrar-empresa`, req)
      .pipe(tap(res => this.salvarSessao(res)));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.usuario.set(null);
  }

  get token(): string | null {
    return this.usuario()?.token ?? null;
  }

  get estaLogado(): boolean {
    return !!this.usuario();
  }

  private salvarSessao(res: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.usuario.set(res);
  }

  private recuperarSessao(): AuthResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
