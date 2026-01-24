import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Person } from "../../models/person";
import { Payment } from "../../models/payment";

@Injectable({
  providedIn: "root",
})
export class PersonService {
  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, divisionId?: number) {
    let queryParams: any = {
      page,
      limit: size,
      divisionId,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/persons?${new URLSearchParams(queryParams).toString()}`);
  }

  get(id: number) {
    return this.http.get<Person>(`${environment.baseUrl}/persons/${id}`);
  }

  getAllByDivision(divisionId: number) {
    return this.http.get<any[]>(`${environment.baseUrl}/persons/division/${divisionId}?isActive=true`);
  }

  save(person: Person) {
    return this.http.post(`${environment.baseUrl}/persons`, person);
  }

  update(person: Person) {
    return this.http.put(`${environment.baseUrl}/persons/${person.id}`, person);
  }

  getPayments(personId: number, year?: number) {
    let queryParams: any = {};
    if (year) queryParams.year = year;
    const queryString = new URLSearchParams(queryParams).toString();
    return this.http.get<Payment[]>(`${environment.baseUrl}/persons/${personId}/late-payments${queryString ? '?' + queryString : ''}`);
  }

  savePayment(personId: number, payment: Partial<Payment>) {
    return this.http.post<Payment>(`${environment.baseUrl}/persons/${personId}/late-payments`, payment);
  }
}
