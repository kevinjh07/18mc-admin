import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Regional } from "../../models/regional";

@Injectable({
  providedIn: "root",
})
export class RegionalService {
  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, commandId?: number | null) {
    let queryParams: any = {
      page,
      limit: size,
      commandId
    };
    return this.http.get<any[]>(`${environment.baseUrl}/regionals?${new URLSearchParams(queryParams).toString()}`);
  }

  get(id: number) {
    return this.http.get<Regional>(`${environment.baseUrl}/regionals/${id}`);
  }

  save(regional: Regional) {
    return this.http.post(`${environment.baseUrl}/regionals`, regional);
  }

  update(regional: Regional) {
    return this.http.put(`${environment.baseUrl}/regionals/${regional.id}`, regional);
  }
}
