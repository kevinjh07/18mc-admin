import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { isBefore } from "date-fns";

import { AuthenticationService } from "../services/auth.service";
import { NotificationService } from "../services/notification.service";

@Injectable()
export class AuthGuard  {
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthenticationService
  ) {}

  canActivate() {
    const user = this.authService.getCurrentUser();

    if (user && user.exp) {
      if (isBefore(new Date(), new Date(user.exp * 1000))) {
        return true;
      } else {
        this.notificationService.openSnackBar("Sua sessão expirou");
        this.router.navigate(["auth/login"]);
        return false;
      }
    }

    this.router.navigate(["auth/login"]);
    return false;
  }
}
