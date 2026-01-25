import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Division } from "src/app/core/models/division";
import { Regional } from "src/app/core/models/regional";
import { CommandService } from "src/app/core/services/command/command.service";
import { DivisionService } from "src/app/core/services/division/division.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";

@Component({
    standalone: false,
  selector: "app-division-registration",
  templateUrl: "./division-registration.component.html",
  styleUrls: ["./division-registration.component.css"],
})
export class DivisionRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  division = new Division();
  commands: any = [];
  regionals: Regional[] = [];

  selectedCommandId: number;

  constructor(
    public formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private commandService: CommandService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private router: Router,
    private logger: NGXLogger,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(150)]],
      commandId: ["", [Validators.required]],
      regionalId: ["", [Validators.required]],
    });

    this.activatedRoute.params.subscribe((params: any) => {
      if (params["id"] > 0) {
        this.get(params.id);
      }
    });
  }

  ngAfterViewInit(): void {
    this.getCommands();
  }

  get(id: number) {
    this.divisionService.get(id).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.division = response;
        this.selectedCommandId = response.Regional.commandId;
        this.getRegionals();
      },
      error: (e) => {
        this.logger.error(e);
        this.blockUI.stop();
        this.notificationService.openSnackBar("Erro ao obter dados da divisão, tente novamente");
      },
    });
  }

  save() {
    if (this.formGroup.invalid) {
      this.notificationService.openSnackBar("Preencha os campos obrigatórios!");
      return;
    }

    if (this.division.id) {
      this.update();
      return;
    }

    this.blockUI.start("Aguarde...");
    this.divisionService.save(this.division).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/division"]);
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
    this.divisionService.update(this.division).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/division"]);
        this.notificationService.openSnackBar("Divisão atualizada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao atualizar divisão, tente novamente");
      },
    });
  }

  getCommands() {
    this.commandService.getAll().subscribe({
      next: (response: any) => {
        this.commands = response;
        this.regionals = [];
      },
      error: (e) => {
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao obter lista de comandos, tente novamente");
      },
    });
  }

  getRegionals() {
    if (!this.selectedCommandId) {
      return;
    }

    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 500, this.selectedCommandId).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.regionals = response?.data || [];
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao carregar lista de regionais");
      },
    });
  }
}

