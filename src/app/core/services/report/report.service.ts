import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(private http: HttpClient) {}

  getDivisionReport(divisionId: number, startDate: string, endDate: string) {
    return this.http.get<any[]>(
      `${environment.baseUrl}/reports?divisionId=${divisionId}&startDate=${startDate}&endDate=${endDate}`
    );
  }
}
