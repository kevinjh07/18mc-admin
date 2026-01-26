import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Class } from "src/app/core/models/class";
import { ClassService } from "src/app/core/services/class/class.service";
import { NotificationService } from "src/app/core/services/notification.service";

@Component({
    standalone: false,
  selector: "app-class-registration",
  templateUrl: "./class-registration.component.html",
  styleUrls: ["./class-registration.component.css"],
})
export class ClassRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  class = new Class();

  constructor(
    public formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private classService: ClassService,
    private router: Router,
    private logger: NGXLogger,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Cadastro Modalidade");

    this.formGroup = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(255)]],
    });

    this.activatedRoute.params.subscribe((params: any) => {
      if (params["id"] > 0) {
        this.getClass(params.id);
      }
    });
  }

  getClass(id: number) {
    this.classService.getById(id).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.class = response;
      },
      error: (e) => {
        this.logger.error(e);
        this.blockUI.stop();
        this.notificationService.openSnackBar("Erro ao obter dados da modalidade, tente novamente");
      },
    });
  }

  saveStudent() {
    if (this.formGroup.invalid) {
      this.notificationService.openSnackBar("Preencha os campos obrigatórios!");
      return;
    }

    if (this.class.id) {
      this.updateStudent();
      return;
    }

    this.blockUI.start("Aguarde...");
    this.classService.save(this.class).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/classes"]);
        this.notificationService.openSnackBar("Modalidade cadastrada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao salvar modalidade, tente novamente");
      },
    });
  }

  updateStudent() {
    this.blockUI.start("Aguarde...");
    this.classService.update(this.class).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/classes"]);
        this.notificationService.openSnackBar("Aluno atualizado com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao atualizar aluno, tente novamente");
      },
    });
  }
}

