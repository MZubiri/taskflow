import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TareaRequest {
  titulo: string;
  descripcion: string;
  estado: string;
  usuarioId?: number;
}

export interface TareaResponse {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  usuarioId?: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private apiUrl = 'http://localhost:8080/api/tareas';

  constructor(private http: HttpClient) {}

  listar(): Observable<TareaResponse[]> {
    return this.http.get<TareaResponse[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<TareaResponse> {
    return this.http.get<TareaResponse>(`${this.apiUrl}/${id}`);
  }

  crear(tarea: TareaRequest): Observable<TareaResponse> {
    return this.http.post<TareaResponse>(this.apiUrl, tarea);
  }

  actualizar(id: number, tarea: TareaRequest): Observable<TareaResponse> {
    return this.http.put<TareaResponse>(`${this.apiUrl}/${id}`, tarea);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
