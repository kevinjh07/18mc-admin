import { UntypedFormGroup, UntypedFormControl, Validators, FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { NotificationService } from "src/app/core/services/notification.service";

@Component({
    standalone: false,
  selector: "app-password-reset",
  templateUrl: "./password-reset.component.html",
  styleUrls: ["./password-reset.component.css"],
})
export class PasswordResetComponent implements OnInit {
  private token!: string;
  email!: string;
  form!: UntypedFormGroup;
  loading!: boolean;
  hideNewPassword: boolean;
  hideNewPasswordConfirm: boolean;
  newPassword: string;
  newPasswordConfirm: string;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private titleService: Title,
    public formBuilder: FormBuilder
  ) {
    this.titleService.setTitle("Password Reset");
    this.hideNewPassword = true;
    this.hideNewPasswordConfirm = true;
  }

  ngOnInit() {
    this.activeRoute.queryParamMap.subscribe((params: ParamMap) => {
      this.token = params.get("token") + "";

      if (!params.get("token")) {
        this.router.navigate(["/"]);
      }
    });

    this.form = this.formBuilder.group(
      {
        newPassword: [
          "",
          [Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)],
        ],
        newPasswordConfirm: ["", Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get("newPassword")?.value === formGroup.get("newPasswordConfirm")?.value
      ? null
      : { mismatch: true };
  }

  resetPassword() {
    this.loading = true;

    debugger
    this.authService
      .passwordReset(this.token, this.newPassword)
      .subscribe({
        next: () => {
          this.notificationService.openSnackBar("Sua senha foi redefinida com sucesso");
          this.router.navigate(["/auth/login"]);
        },
        error: (error: any) => {
          this.notificationService.openSnackBar(error.error);
        },
      })
      .add(() => (this.loading = false));
  }

  cancel() {
    this.router.navigate(["/"]);
  }
}

