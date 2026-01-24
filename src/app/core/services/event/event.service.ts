import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Event } from "../../models/event";
import { Person } from "../../models/person";
import { EventType } from "../../models/event-type";

@Injectable({
  providedIn: "root",
})
export class EventService {
  constructor(private http: HttpClient) {}

  getAll(page: number, size: number, eventType: EventType, regionalId?: number, divisionId?: number) {
    let queryParams: any = {
      page,
      limit: size,
      regionalId,
      divisionId,
      eventType,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/events?${new URLSearchParams(queryParams).toString()}`);
  }

  save(event: Event) {
    return this.http.post(`${environment.baseUrl}/events`, event);
  }

  get(id: number) {
    return this.http.get<Event>(`${environment.baseUrl}/events/${id}`);
  }

  update(event: Event) {
    return this.http.put(`${environment.baseUrl}/events/${event.id}`, event);
  }

  getParticipants(id: any) {
    return this.http.get<string>(`${environment.baseUrl}/events/${id}/persons`);
  }
}
