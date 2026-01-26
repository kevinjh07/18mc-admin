import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Division } from "src/app/core/models/division";
import { Event } from "src/app/core/models/event";
import { DivisionService } from "src/app/core/services/division/division.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { EventService } from "src/app/core/services/event/event.service";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, NativeDateAdapter } from "@angular/material/core";
import { DualListComponent } from "angular-dual-listbox";
import { PersonService } from "src/app/core/services/person/person.service";
import { Person } from "src/app/core/models/person";
import { Regional } from "src/app/core/models/regional";
import { RegionalService } from "src/app/core/services/regional/regional.service";
import { Title } from "@angular/platform-browser";
import { EventType } from "src/app/core/models/event-type";
import { CommandService } from "src/app/core/services/command/command.service";

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
    standalone: false,
  selector: "app-poll-registration",
  templateUrl: "./poll-registration.component.html",
  styleUrls: ["./poll-registration.component.css"],
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
export class PollRegistrationComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public formGroup: FormGroup;
  poll = new Event();
  commands: any = [];
  regionals: Regional[] = [];
  divisions: Division[] = [];
  availablePerson: Person[] = [];
  selectedPerson: Person[] = [];
  selectedCommandId: number;

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
    private eventService: EventService,
    private commandService: CommandService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private personService: PersonService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Enquetes - 18 Admin");

    this.formGroup = this.formBuilder.group({
      title: ["", [Validators.required, Validators.maxLength(150)]],
      date: ["", [Validators.required, Validators.maxLength(50)]],
      description: ["", [Validators.required, Validators.maxLength(1000)]],
      commandId: ["", [Validators.required]],
      regionalId: ["", [Validators.required]],
      divisionId: ["", [Validators.required]],
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
    this.eventService.get(id).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.poll = response;
        this.selectedCommandId = response.Division.Regional.commandId;
        this.poll.regionalId = response.Division.Regional.id;
        this.poll.divisionId = response.Division.id;
        this.selectedPerson = response.People || [];

        this.formGroup.patchValue({
          title: this.poll.title,
          date: this.poll.date,
          description: this.poll.description,
          commandId: this.selectedCommandId,
          regionalId: this.poll.regionalId,
          divisionId: this.poll.divisionId
        });

        this.getPersons();
      },
      error: (e) => {
        this.logger.error(e);
        this.blockUI.stop();
        this.notificationService.openSnackBar("Erro ao obter dados da enquete, tente novamente");
      },
    });
  }

  save() {
    if (this.formGroup.invalid) {
      this.notificationService.openSnackBar("Preencha os campos obrigatórios!");
      return;
    }

    const formValues = this.formGroup.value;
    this.poll.title = formValues.title;
    this.poll.date = formValues.date;
    this.poll.description = formValues.description;
    this.poll.divisionId = formValues.divisionId;

    this.poll.eventType = EventType.POLL;

    if (this.poll.id) {
      this.update();
      return;
    }

    this.blockUI.start("Aguarde...");
    this.eventService.save(this.poll).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/poll"]);
        this.notificationService.openSnackBar("Enquete cadastrada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao salvar enquete, tente novamente");
      },
    });
  }

  update() {
    this.blockUI.start("Aguarde...");
    this.poll.personIds = this.selectedPerson.map((sp) => sp["id"]);
    this.eventService.update(this.poll).subscribe({
      next: () => {
        this.blockUI.stop();
        this.router.navigate(["/poll"]);
        this.notificationService.openSnackBar("Enquete atualizada com sucesso!");
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao atualizar enquete, tente novamente");
      },
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

  getRegionals() {
    this.selectedCommandId = this.formGroup.get('commandId')?.value || this.selectedCommandId;
    if (!this.selectedCommandId) {
      return;
    }

    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 30, this.selectedCommandId).subscribe({
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

  onCommandChange() {
    this.formGroup.patchValue({ regionalId: '', divisionId: '' });
    this.getRegionals();
  }

  onRegionalChange() {
    this.formGroup.patchValue({ divisionId: '' });
    this.getDivisions();
  }

  getDivisions() {
    const regionalId = this.formGroup.get('regionalId')?.value || this.poll.regionalId;
    if (!regionalId) {
      return;
    }

    this.blockUI.start("Aguarde...");
    this.divisionService.getAllByRegionalId(regionalId).subscribe({
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
    this.personService.getAllByDivision(this.poll.divisionId).subscribe({
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

