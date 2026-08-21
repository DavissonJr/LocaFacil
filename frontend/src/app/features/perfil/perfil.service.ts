import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlterarSenhaRequest, AtualizarPerfilRequest, ExcluirEmpresaRequest, Perfil } from '../../core/models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly url = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  obterPerfil(): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.url}/perfil`);
  }

  atualizarPerfil(req: AtualizarPerfilRequest): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.url}/perfil`, req);
  }

  alterarSenha(req: AlterarSenhaRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/senha`, req);
  }

  excluirEmpresa(req: ExcluirEmpresaRequest): Observable<void> {
    return this.http.delete<void>(`${this.url}/empresa`, { body: req });
  }
}
