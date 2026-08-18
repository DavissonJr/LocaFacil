import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contrato, ContratoRequest } from '../../core/models/contrato.model';

@Injectable({ providedIn: 'root' })
export class ContratosService {
  private readonly url = `${environment.apiUrl}/contratos`;

  constructor(private http: HttpClient) {}

  listar(status?: string): Observable<Contrato[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Contrato[]>(this.url, { params });
  }

  criar(req: ContratoRequest): Observable<Contrato> {
    return this.http.post<Contrato>(this.url, req);
  }

  finalizar(id: string, kmFinal: number): Observable<Contrato> {
    return this.http.post<Contrato>(`${this.url}/${id}/finalizar`, { kmFinal });
  }

  cancelar(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/cancelar`, {});
  }
}
