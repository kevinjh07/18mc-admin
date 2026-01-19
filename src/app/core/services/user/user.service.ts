import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { User } from "src/app/core/models/user";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAll(page: number, size: number) {
    let queryParams: any = {
      page,
      limit: size,
    };
    return this.http.get<any[]>(`${environment.baseUrl}/users?${new URLSearchParams(queryParams).toString()}`);
  }

  save(user: User) {
    return this.http.post(`${environment.baseUrl}/users/register`, {
      name: user.name,
      email: user.email,
      password: user.password,
    });
  }

  update(user: User) {
    return this.http.patch(`${environment.baseUrl}/users/${user.id}`, {
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    });
  }

  get(id: number) {
    return this.http.get<User>(`${environment.baseUrl}/users/${id}`);
  }
}
