import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Division } from "../../models/division";

@Injectable({
  providedIn: "root",
})
export class DivisionService {
  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, regionalId?: number) {
    let queryParams: any = {
      page,
      limit: size,
      regionalId,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/divisions?${new URLSearchParams(queryParams).toString()}`);
  }

  getAllByRegionalId(regionalId: number) {
    let queryParams: any = {
      regionalId,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/divisions?${new URLSearchParams(queryParams).toString()}`);
  }

  get(id: number) {
    return this.http.get<Division>(`${environment.baseUrl}/divisions/${id}`);
  }

  save(division: Division) {
    return this.http.post(`${environment.baseUrl}/divisions`, division);
  }

  update(division: Division) {
    return this.http.put(`${environment.baseUrl}/divisions/${division.id}`, division);
  }
}
