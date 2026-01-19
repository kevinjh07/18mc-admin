import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, delay, map, switchMap } from "rxjs/operators";
import jwt_decode from "jwt-decode";

import { environment } from "../../../environments/environment";
import { of, throwError, BehaviorSubject } from "rxjs";
import { FilterService } from "./filter/filter.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private filterService: FilterService,
    private router: Router
  ) {}

  login(email: string, password: string) {
    return this.http.post(`${environment.baseUrl}/users/login`, { email, password }).pipe(
      map((response: any) => {
        const token = response["accessToken"];
        let decodedToken: any = jwt_decode(token);
        decodedToken["token"] = token;
        let currentUser: any = JSON.stringify(decodedToken);
        this.localStorage.setItem("currentUser", currentUser);
        this.localStorage.setItem('refreshToken', response['refreshToken']);
        return decodedToken;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  logout(): void {
    this.localStorage.removeItem("currentUser");
    this.localStorage.removeItem("refreshToken");
    this.filterService.clear();
  }

  getCurrentUser(): any {
    const currentUser: any = this.localStorage.getItem("currentUser");
    return JSON.parse(currentUser);
  }

  passwordResetRequest(email: string) {
    return this.http.post(`${environment.baseUrl}/users/password-reset-request`, { email });
  }

  changePassword(email: string, currentPwd: string, newPwd: string) {
    return of(true).pipe(delay(1000));
  }

  passwordReset(token: string, newPassword: string): any {
    return this.http.post(`${environment.baseUrl}/users/password-reset`, { token, newPassword });
  }

  roleMatch(allowedRoles: any[]) {
    let match = false;
    const currentUser = localStorage.getItem('currentUser');
    const payload = currentUser ? JSON.parse(currentUser) : null;
    allowedRoles.forEach((role) => {
      if (payload.role === role) {
        match = true;
      }
    });

    return match;
  }

  refreshToken() {
    const refreshToken = this.localStorage.getItem('refreshToken');
    return this.http.post(`${environment.baseUrl}/users/refresh-token`, { refreshToken }).pipe(
      map((response: any) => {
        const token = response["accessToken"];
        let decodedToken: any = jwt_decode(token);
        decodedToken["token"] = token;
        let currentUser: any = JSON.stringify(decodedToken);
        this.localStorage.setItem("currentUser", currentUser);
        this.localStorage.setItem('refreshToken', response['refreshToken']);
        return decodedToken;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  handle401Error(request: any, next: any) {
    if (!this.refreshTokenInProgress) {
      this.refreshTokenInProgress = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((token: any) => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token.token));
        }),
        catchError((error) => {
          this.refreshTokenInProgress = false;
          this.logout();
          this.localStorage.setItem('lastUrl', this.router.url);
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        switchMap((token: any) => {
          return next.handle(this.addToken(request, token.token));
        })
      );
    }
  }

  addToken(request: any, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  redirectToLastUrl() {
    const lastUrl = this.localStorage.getItem('lastUrl');
    if (lastUrl) {
      this.localStorage.removeItem('lastUrl');
      this.router.navigate([lastUrl]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
