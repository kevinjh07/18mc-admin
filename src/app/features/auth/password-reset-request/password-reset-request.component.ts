import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { NotificationService } from 'src/app/core/services/notification.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
    standalone: false,
  selector: 'app-password-reset-request',
  templateUrl: './password-reset-request.component.html',
  styleUrls: ['./password-reset-request.component.css']
})
export class PasswordResetRequestComponent implements OnInit {

  private email!: string;
  form!: UntypedFormGroup;
  loading!: boolean;

  constructor(private authService: AuthenticationService,
    private notificationService: NotificationService,
    private titleService: Title,
    private router: Router) { }

  ngOnInit() {
    this.titleService.setTitle('Redefinir Senha');

    this.form = new UntypedFormGroup({
      email: new UntypedFormControl("", [Validators.required, Validators.email]),
    });

    this.form.get("email")?.valueChanges.subscribe((val: string) => {
      this.email = val.toLowerCase();
    });
  }

  resetPassword() {
    this.loading = true;
    this.authService.passwordResetRequest(this.email).subscribe({
      next: () => {
        this.router.navigate(["/auth/login"]);
        this.notificationService.openSnackBar(
          "Um email de redefinição de senha foi enviado para o seu endereço de email"
        );
      },
      error: (error: any) => {
        if (error.status === 422) {
          this.notificationService.openSnackBar("Email não encontrado");
        } else {
          this.notificationService.openSnackBar("Erro ao enviar email de redefinição de senha");
        }

      },
    })
    .add(() => this.loading = false);
  }

  cancel() {
    this.router.navigate(["/"]);
  }
}

