import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Division } from "src/app/core/models/division";
import { Person } from "src/app/core/models/person";
import { Regional } from "src/app/core/models/regional";
import { DivisionService } from "src/app/core/services/division/division.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { PersonService } from "src/app/core/services/person/person.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";
import { PersonLatePaymentDialogComponent } from "../person-late-payment-dialog/person-late-payment-dialog.component";
import { CommandService } from "src/app/core/services/command/command.service";

@Component({
  selector: "app-person-registration",
  templateUrl: "./person-registration.component.html",
  styleUrls: ["./person-registration.component.css"],
})
export class PersonRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  person = new Person();
  commands: any = [];
  regionals: Regional[] = [];
  divisions: Division[] = [];

  selectedCommandId: number;
  selectedRegionalId: number;

  constructor(
    public formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private personService: PersonService,
    private router: Router,
    private logger: NGXLogger,
    private activatedRoute: ActivatedRoute,
    private commandService: CommandService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      fullName: ["", [Validators.required, Validators.maxLength(150)]],
      shortName: ["", [Validators.required, Validators.maxLength(50)]],
      commandId: ["", [Validators.required]],
      regionalId: ["", [Validators.required]],
      divisionId: ["", [Validators.required]],
      hierarchyLevel: ["", [Validators.required]],
      isActive: [true, [Validators.required]],
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
    this.personService.get(id).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.person = response;
        this.selectedCommandId = response.Division.Regional.commandId;
        this.selectedRegionalId = response.Division.Regional.id;
        this.getDivisions();
      },
      error: (e) => {
        this.logger.error(e);
        this.blockUI.stop();
        this.notificationService.openSnackBar("Erro ao obter dados do integrante, tente novamente");
      },
    });
  }

  save() {
    if (this.formGroup.invalid) {
      this.notificationService.openSnackBar("Preencha os campos obrigatórios!");
      return;
    }

    if (this.person.id) {
      this.update();
      return;
    }

    this.blockUI.start("Aguarde...");
    this.personService.save(this.person).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/person"]);
        this.notificationService.openSnackBar("Integrante cadastrado com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        if (e.status === 422) {
          this.notificationService.openSnackBar(e.error.error);
        } else {
          this.notificationService.openSnackBar("Erro ao salvar integrante, tente novamente");
        }
      },
    });
  }

  update() {
    this.blockUI.start("Aguarde...");
    this.personService.update(this.person).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/person"]);
        this.notificationService.openSnackBar("Integrante atualizado com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        if (e.status === 422) {
          this.notificationService.openSnackBar(e.error.error);
        } else {
          this.notificationService.openSnackBar("Erro ao atualizar integrante, tente novamente");
        }
      },
    });
  }

  getRegionals() {
    if (!this.selectedCommandId) {
      return;
    }

    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 100, this.selectedCommandId).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.regionals = response?.data || [];
        this.getDivisions();
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao carregar lista de regionais");
      },
    });
  }

  getDivisions() {
    this.blockUI.start("Aguarde...");
    this.divisionService.getAllByRegionalId(this.selectedRegionalId).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.divisions = response?.data || [];
        if (!this.selectedCommandId) {
          this.selectedCommandId = this.regionals.find(r => r.id === this.selectedRegionalId)?.command.id;
        }
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao carregar lista de divisões");
      },
    });
  }

  openLatePaymentDialog() {
    this.dialog.open(PersonLatePaymentDialogComponent, {
      width: '80%',
      data: { personId: this.person.id }
    });
  }

  getCommands() {
    this.commandService.getAll().subscribe({
      next: (response: any) => {
        this.commands = response;
        this.regionals = [];
        this.getRegionals();
      },
      error: (e) => {
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao obter lista de comandos, tente novamente");
      },
    });
  }
}
