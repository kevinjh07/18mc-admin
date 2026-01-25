import { Component, OnInit, ViewChild } from "@angular/core";
import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";
import { MatSort } from "@angular/material/sort";
import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";
import { Title } from "@angular/platform-browser";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Division } from "src/app/core/models/division";
import { Filter } from "src/app/core/models/filter";
import { Regional } from "src/app/core/models/regional";
import { CommandService } from "src/app/core/services/command/command.service";
import { DivisionService } from "src/app/core/services/division/division.service";
import { FilterService } from "src/app/core/services/filter/filter.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { PersonService } from "src/app/core/services/person/person.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";

@Component({
  selector: "app-person-list",
  templateUrl: "./person-list.component.html",
  styleUrls: ["./person-list.component.css"],
})
export class PersonListComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["shortName", "hierarchyLevel", "isActive", "actions"];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  commands: any = [];
  regionals: Regional[] = [];
  divisions: Division[] = [];
  selectedCommandId: number;
  selectedRegionalId: number;
  selectedDivisionId: number;

  constructor(
    private logger: NGXLogger,
    private notificationService: NotificationService,
    private personService: PersonService,
    private commandService: CommandService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private filterService: FilterService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Integrantes - 18 Admin");
  }

  ngAfterViewInit(): void {
    this.setupPaginator();
    this.getCommands();

    const filter = this.filterService.getFilter();

    if (filter.personListCommandId) {
      this.selectedCommandId = filter.personListCommandId;
      if (filter.personListRegionalId) {
        this.selectedRegionalId = filter.personListRegionalId;
        this.getRegionals();
        if (filter.personListDivisionId) {
          this.selectedDivisionId = filter.personListDivisionId;
          if (!isNaN(this.selectedCommandId) && !isNaN(this.selectedRegionalId) && !isNaN(this.selectedDivisionId)) {
            this.getPersons();
          }
        }
      }
    }
  }

  private setupPaginator(): void {
    this.dataSource.paginator = this.paginator;
  }

  getPersons() {
    this.filterService.updateFilter({ personListDivisionId: this.selectedDivisionId });

    this.blockUI.start("Aguarde...");
    this.personService
      .getAll(this.paginator.pageIndex + 1, this.paginator.pageSize, this.selectedDivisionId)
      .subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          const persons = response?.data || [];
          this.dataSource.data = persons;

          setTimeout(() => {
            this.paginator.length = response?.totalItems;
            this.paginator.pageIndex = response?.currentPage - 1;
          }, 100);
        },
        error: (e) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar("Erro ao carregar lista de integrantes");
        },
      });
  }

  getRegionals() {
    if (!this.selectedCommandId) {
      return;
    }

    this.filterService.updateFilter({ personListCommandId: this.selectedCommandId });

    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 500, this.selectedCommandId).subscribe({
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
    this.filterService.updateFilter({ personListRegionalId: this.selectedRegionalId });

    this.blockUI.start("Aguarde...");
    this.divisionService.getAllByRegionalId(this.selectedRegionalId).subscribe({
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

  getCommands() {
    this.commandService.getAll().subscribe({
      next: (response: any) => {
        this.commands = response;
        this.dataSource.data = [];
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
