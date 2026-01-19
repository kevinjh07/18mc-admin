import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ChartService {
  constructor(private http: HttpClient) {}

  getSocialActionCountByDateRange(startDate: string, endDate: string, regionalId: number) {
    let queryParams: any = {
      startDate,
      endDate,
      regionalId,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/charts?${new URLSearchParams(queryParams).toString()}`);
  }

  getSocialActionByTypeCountByDateRange(startDate: string, endDate: string, regionalId: number) {
    let queryParams: any = {
      startDate,
      endDate,
      regionalId,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/charts/action-type?${new URLSearchParams(queryParams).toString()}`);
  }

  getSocialActionsByPersonAndDivision(startDate: string, endDate: string, divisionId: number) {
    let queryParams: any = {
      startDate,
      endDate,
      divisionId,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/charts/person-division?${new URLSearchParams(queryParams).toString()}`);
  }
}
