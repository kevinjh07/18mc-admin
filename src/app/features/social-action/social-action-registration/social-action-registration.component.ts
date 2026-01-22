import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Division } from "src/app/core/models/division";
import { SocialAction } from "src/app/core/models/socialAction";
import { DivisionService } from "src/app/core/services/division/division.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { SocialActionService } from "src/app/core/services/social-action/social-action.service";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, NativeDateAdapter } from "@angular/material/core";
import { DualListComponent } from "angular-dual-listbox";
import { PersonService } from "src/app/core/services/person/person.service";
import { Person } from "src/app/core/models/person";
import { Regional } from "src/app/core/models/regional";
import { RegionalService } from "src/app/core/services/regional/regional.service";
import { Title } from "@angular/platform-browser";

export const DEFAULT_FORMATS = {
  parse: {
    dateInput: "dd/MM/yyyy",
  },
  display: {
    dateInput: "dd/MM/yyyy",
    monthYearLabel: "MMM yyyy",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM yyyy",
  },
};

@Component({
  selector: "app-social-action-registration",
  templateUrl: "./social-action-registration.component.html",
  styleUrls: ["./social-action-registration.component.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: NativeDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: DEFAULT_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "pt-BR" },
  ],
})
export class SocialActionRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  socialAction = new SocialAction();
  regionals: Regional[] = [];
  divisions: Division[] = [];
  availablePerson: Person[] = [];
  selectedPerson: Person[] = [];

  format = {
    add: "Adicionar",
    remove: "Remover",
    all: "Todos",
    none: "Nenhum",
    direction: DualListComponent.LTR,
    draggable: true,
    locale: "pt",
  };

  constructor(
    public formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private router: Router,
    private logger: NGXLogger,
    private activatedRoute: ActivatedRoute,
    private socialActionService: SocialActionService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private personService: PersonService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Ações Sociais - 18 MC Admin");

    this.formGroup = this.formBuilder.group({
      title: ["", [Validators.required, Validators.maxLength(150)]],
      date: ["", [Validators.required, Validators.maxLength(50)]],
      description: ["", [Validators.required, Validators.maxLength(1000)]],
      regionalId: ["", [Validators.required]],
      divisionId: ["", [Validators.required]],
      actionType: ["", [Validators.required]],
    });

    this.activatedRoute.params.subscribe((params: any) => {
      if (params["id"] > 0) {
        this.get(params.id);
      }
    });
  }

  ngAfterViewInit(): void {
    this.getRegionals();
  }

  get(id: number) {
    this.socialActionService.get(id).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.socialAction = response;
        this.socialAction.regionalId = response.Division.Regional.id;
        this.socialAction.divisionId = response.Division.id;
        this.selectedPerson = response.People || [];
        this.getPersons();
      },
      error: (e) => {
        this.logger.error(e);
        this.blockUI.stop();
        this.notificationService.openSnackBar("Erro ao obter dados da ação social, tente novamente");
      },
    });
  }

  save() {
    if (this.formGroup.invalid) {
      this.notificationService.openSnackBar("Preencha os campos obrigatórios!");
      return;
    }

    if (this.socialAction.id) {
      this.update();
      return;
    }

    this.blockUI.start("Aguarde...");
    this.socialActionService.save(this.socialAction).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/social-action"]);
        this.notificationService.openSnackBar("Ação social cadastrada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao salvar ação social, tente novamente");
      },
    });
  }

  update() {
    this.blockUI.start("Aguarde...");
    this.socialAction.personIds = this.selectedPerson.map((sp) => sp["id"]);
    this.socialActionService.update(this.socialAction).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/social-action"]);
        this.notificationService.openSnackBar("Ação social atualizada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao atualizar ação social, tente novamente");
      },
    });
  }

  getRegionals() {
    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 30, null).subscribe({
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
    this.divisionService.getAllByRegionalId(this.socialAction.regionalId).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.divisions = response?.data || [];
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao carregar lista de divisões");
      },
    });
  }

  getPersons() {
    this.blockUI.start("Aguarde...");
    this.personService.getAllByDivision(this.socialAction.divisionId).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.availablePerson = response || [];
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
      },
    });
  }
}
