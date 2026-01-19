import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Class } from "../../models/class";

@Injectable({
  providedIn: "root",
})
export class ClassService {
  constructor(private http: HttpClient) {}

  getAll(pageNumber: number, pageSize: number, sortField: string, sortDirection: string) {
    let queryParams: any = {
      page_number: pageNumber,
      page_size: pageSize,
      sort_field: sortField,
      sort_direction: sortDirection,
    };
    return this.http.get<Class[]>(`${environment.baseUrl}/classes?${new URLSearchParams(queryParams).toString()}`);
  }

  getById(id: number) {
    return this.http.get<Class[]>(`${environment.baseUrl}/classes/${id}`);
  }

  getOptions() {
    return this.http.get<Class[]>(`${environment.baseUrl}/classes/options`);
  }

  save(studentClass: Class) {
    return this.http.post(`${environment.baseUrl}/classes`, studentClass);
  }

  update(studentClass: Class) {
    return this.http.put(`${environment.baseUrl}/classes/${studentClass.id}`, studentClass);
  }
}
