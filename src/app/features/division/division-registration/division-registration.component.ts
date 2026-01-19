import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Division } from "src/app/core/models/division";
import { Regional } from "src/app/core/models/regional";
import { DivisionService } from "src/app/core/services/division/division.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";

@Component({
  selector: "app-division-registration",
  templateUrl: "./division-registration.component.html",
  styleUrls: ["./division-registration.component.css"],
})
export class DivisionRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  division = new Division();
  regionals: Regional[] = [];

  constructor(
    public formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private divisionService: DivisionService,
    private regionalService: RegionalService,
    private router: Router,
    private logger: NGXLogger,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(150)]],
      regionalId: ["", [Validators.required]],
    });

    this.activatedRoute.params.subscribe((params: any) => {
      if (params["id"] > 0) {
        this.get(params.id);
      }
    });
  }

  ngAfterViewInit(): void {
    this.listRegionals();
  }

  get(id: number) {
    this.divisionService.get(id).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.division = response;
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

  listRegionals() {
    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 3, null).subscribe({
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
