import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { SocialAction } from "../../models/socialAction";
import { Person } from "../../models/person";

@Injectable({
  providedIn: "root",
})
export class SocialActionService {
  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, regionalId?: number, divisionId?: number) {
    let queryParams: any = {
      page,
      limit: size,
      regionalId,
      divisionId,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/social-actions?${new URLSearchParams(queryParams).toString()}`);
  }

  save(socialAction: SocialAction) {
    return this.http.post(`${environment.baseUrl}/social-actions`, socialAction);
  }

  get(id: number) {
    return this.http.get<SocialAction>(`${environment.baseUrl}/social-actions/${id}`);
  }

  update(socialAction: SocialAction) {
    return this.http.put(`${environment.baseUrl}/social-actions/${socialAction.id}`, socialAction);
  }

  getParticipants(id: any) {
    return this.http.get<string>(`${environment.baseUrl}/social-actions/${id}/persons`);
  }
}
