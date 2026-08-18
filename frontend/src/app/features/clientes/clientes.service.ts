import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteRequest } from '../../core/models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly url = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  listar(busca?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    if (busca) params = params.set('busca', busca);
    return this.http.get<Cliente[]>(this.url, { params });
  }

  obterPorId(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  criar(req: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, req);
  }

  atualizar(id: string, req: ClienteRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, req);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
