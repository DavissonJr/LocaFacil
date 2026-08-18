import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Veiculo, VeiculoRequest } from '../../core/models/veiculo.model';

@Injectable({ providedIn: 'root' })
export class VeiculosService {
  private readonly url = `${environment.apiUrl}/veiculos`;

  constructor(private http: HttpClient) {}

  listar(status?: string): Observable<Veiculo[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Veiculo[]>(this.url, { params });
  }

  obterPorId(id: string): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.url}/${id}`);
  }

  criar(req: VeiculoRequest): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.url, req);
  }

  atualizar(id: string, req: VeiculoRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, req);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  uploadImagem(id: string, arquivo: File): Observable<Veiculo> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<Veiculo>(`${this.url}/${id}/imagem`, formData);
  }
}
