import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
 
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthenticationService,
        private router: Router,
        private dialog: MatDialog) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const user = this.authService.getCurrentUser();

        if (user && user.token) {

            const cloned = req.clone({
                headers: req.headers.set('Authorization',
                    'Bearer ' + user.token)
            });

            return next.handle(cloned).pipe(
                tap(() => { }, (err: any) => {
                    if (err instanceof HttpErrorResponse) {
                        if (err.status === 401) {
                            this.dialog.closeAll();
                            this.router.navigate(['/auth/login']);
                        }
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        return this.authService.handle401Error(req, next);
                    }
                    return throwError(() => error);
                }),
                map(event => event as HttpEvent<any>)
            );

        } else {
            return next.handle(req);
        }
    }
}
