import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UntypedFormControl, Validators, UntypedFormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { NGXLogger } from "ngx-logger";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  loading!: boolean;
  hidePassword = true;

  constructor(
    private router: Router,
    private titleService: Title,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.titleService.setTitle("Login");
    this.authenticationService.logout();
    this.createForm();
  }

  private createForm() {
    const savedUserEmail = localStorage.getItem("savedUserEmail");

    this.loginForm = new UntypedFormGroup({
      email: new UntypedFormControl(savedUserEmail, [Validators.required, Validators.email]),
      password: new UntypedFormControl("", Validators.required),
      rememberMe: new UntypedFormControl(savedUserEmail !== null),
    });
  }

  login() {
    const email = this.loginForm.get("email")?.value;
    const password = this.loginForm.get("password")?.value;
    const rememberMe = this.loginForm.get("rememberMe")?.value;

    this.loading = true;
    this.authenticationService.login(email.toLowerCase(), password).subscribe({
      next: (data) => {
        if (rememberMe) {
          localStorage.setItem("savedUserEmail", email);
        } else {
          localStorage.removeItem("savedUserEmail");
        }
        this.authenticationService.redirectToLastUrl();
        this.loading = false;
      },
      error: (error) => {
        this.logger.error(error);
        let errorMessage = "";
        if (error.status === 401) {
          errorMessage = "E-mail ou senha inválidos";
        } else if (error.status === 403) {
          errorMessage = error.error;
        } else {
          errorMessage = "Erro ao realizar login, tente novamente";
        }
        this.notificationService.openSnackBar(errorMessage);
        this.loading = false;
      },
    });
  }

  resetPassword() {
    this.router.navigate(["/auth/password-reset-request"]);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
