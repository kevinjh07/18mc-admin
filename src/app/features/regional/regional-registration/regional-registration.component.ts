import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Regional } from "src/app/core/models/regional";
import { CommandService } from "src/app/core/services/command/command.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";

@Component({
    standalone: false,
  selector: "app-regional-registration",
  templateUrl: "./regional-registration.component.html",
  styleUrls: ["./regional-registration.component.css"],
})
export class RegionalRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  regional = new Regional();
  commands: any = [];
  selectedCommandId: number | null = null;

  constructor(
    public formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private regionalService: RegionalService,
    private commandService: CommandService,
    private router: Router,
    private logger: NGXLogger,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(100)]],
      commandId: ["", [Validators.required]],
    });

    this.activatedRoute.params.subscribe((params: any) => {
      if (params["id"] > 0) {
        this.getCommands(params.id);
      }
    });
  }

  getCommands(id: number) {
    this.commandService.getAll().subscribe({
      next: (response: any) => {
        this.commands = response;
        this.get(id);
      },
      error: (e) => {
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao obter lista de comandos, tente novamente");
      },
    });
  }

  get(id: number) {
    this.regionalService.get(id).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.regional = response;
        this.formGroup.patchValue({
          name: this.regional.name,
          commandId: this.regional.commandId
        });
      },
      error: (e) => {
        this.logger.error(e);
        this.blockUI.stop();
        this.notificationService.openSnackBar("Erro ao obter dados do aluno, tente novamente");
      },
    });
  }

  save() {
    if (this.formGroup.invalid) {
      this.notificationService.openSnackBar("Preencha os campos obrigatórios!");
      return;
    }

    const formValues = this.formGroup.value;
    this.regional.name = formValues.name;
    this.regional.commandId = formValues.commandId;

    if (this.regional.id) {
      this.update();
      return;
    }

    this.blockUI.start("Aguarde...");
    this.regionalService.save(this.regional).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/regional"]);
        this.notificationService.openSnackBar("Divisão cadastrada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao salvar divisão, tente novamente");
      },
    });
  }

  update() {
    this.blockUI.start("Aguarde...");
    this.regionalService.update(this.regional).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/regional"]);
        this.notificationService.openSnackBar("Divisão atualizada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao atualizar divisão, tente novamente");
      },
    });
  }
}

