import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { User } from "src/app/core/models/user";
import { NotificationService } from "src/app/core/services/notification.service";
import { UserService } from "src/app/core/services/user/user.service";

@Component({
  selector: "app-user-registration",
  templateUrl: "./user-registration.component.html",
  styleUrls: ["./user-registration.component.css"],
})
export class UserRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  user = new User();
  isEditMode = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    public formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private userService: UserService,
    private router: Router,
    private logger: NGXLogger,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group(
      {
        name: ["", [Validators.required, Validators.maxLength(150)]],
        email: ["", [Validators.required, Validators.maxLength(150), Validators.email]],
        password: [
          "",
          [Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)],
        ],
        confirmPassword: ["", []],
        isActive: ["", []],
      },
      { validator: this.passwordMatchValidator }
    );

    this.activatedRoute.params.subscribe((params: any) => {
      if (params["id"] > 0) {
        this.isEditMode = true;
        this.get(params.id);
      } else {
        this.formGroup.controls["password"].setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ]);
        this.formGroup.controls["confirmPassword"].setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ]);
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get("password")?.value === formGroup.get("confirmPassword")?.value ? null : { mismatch: true };
  }

  get(id: number) {
    this.userService
      .get(id)
      .subscribe({
        next: (response: User) => {
          this.user = response;
        },
        error: (e) => {
          this.logger.error(e);
          this.notificationService.openSnackBar("Erro ao obter dados do usuário, tente novamente");
        },
      })
      .add(() => this.blockUI.stop());
  }

  save() {
    if (this.formGroup.invalid) {
      this.notificationService.openSnackBar("Preencha os campos obrigatórios");
      return;
    }

    if (this.isEditMode) {
      this.update();
      return;
    }

    this.blockUI.start("Aguarde...");
    this.userService
      .save(this.user)
      .subscribe({
        next: () => {
          this.router.navigate(["/user"]);
          this.notificationService.openSnackBar("Usuário cadastrado com sucesso");
        },
        error: (e) => {
          this.logger.error(e);
          if (e.error && e.error.error) {
            this.notificationService.openSnackBar(e.error.error);
            return;
          }
          this.notificationService.openSnackBar("Erro ao salvar usuário, tente novamente");
        },
      })
      .add(() => {
        this.blockUI.stop();
      });
  }

  update() {
    this.blockUI.start("Aguarde...");
    this.userService
      .update(this.user)
      .subscribe({
        next: () => {
          this.router.navigate(["/user"]);
          this.notificationService.openSnackBar("Usuário atualizado com sucesso");
        },
        error: (e) => {
          this.logger.error(e);
          this.notificationService.openSnackBar("Erro ao atualizar usuário, tente novamente");
        },
      })
      .add(() => {
        this.blockUI.stop();
      });
  }

  compareWith(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
