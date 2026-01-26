import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Division } from "src/app/core/models/division";
import { Regional } from "src/app/core/models/regional";
import { CommandService } from "src/app/core/services/command/command.service";
import { DivisionService } from "src/app/core/services/division/division.service";
import { FilterService } from "src/app/core/services/filter/filter.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";
import { EventService } from "src/app/core/services/event/event.service";
import { EventParticipantDialogComponent } from "../event-participant-dialog/event-participant-dialog.component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Title } from "@angular/platform-browser";
import { EventType } from "src/app/core/models/event-type";

@Component({
    standalone: false,
  selector: "app-event-list",
  templateUrl: "./event-list.component.html",
  styleUrls: ["./event-list.component.css"],
})
export class EventListComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["title", "date", "divisionName", "actions", "actions-mobile"];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  regionals: Regional[] = [];
  divisions: Division[] = [];
  commands: any = [];
  selectedCommandId: number;
  selectedRegionalId: number;
  selectedDivisionId: number;

  isSmallScreen: boolean = false;

  constructor(
    private logger: NGXLogger,
    private notificationService: NotificationService,
    private eventService: EventService,
    private commandService: CommandService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private filterService: FilterService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.observeScreenSize();
    this.titleService.setTitle("Eventos - 18 Admin");
  }

  observeScreenSize(): void {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => this.updateDisplayedColumns(result.matches));
  }

  updateDisplayedColumns(isSmallScreen: boolean): void {
    this.isSmallScreen = isSmallScreen;
    this.displayedColumns = isSmallScreen
      ? ["title", "date", "actions-mobile"]
      : ["title", "date", "actions"];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.getCommands();

    const filter = this.filterService.getFilter();
    if (filter.eventListCommandId) {
      this.selectedCommandId = filter.eventListCommandId;
      if (filter.eventListRegionalId) {
        this.selectedRegionalId = filter.eventListRegionalId;
        this.getDivisions();
        if (filter.eventListDivisionId) {
          this.selectedDivisionId = filter.eventListDivisionId;
        }
        this.getEvents();
      }
    }
  }

  getEvents() {
    if (!this.selectedDivisionId) {
      return;
    }

    this.filterService.updateFilter({ eventListDivisionId: this.selectedDivisionId });

    this.blockUI.start("Aguarde...");
    this.eventService
      .getAll(this.paginator.pageIndex + 1, this.paginator.pageSize, EventType.OTHER, this.selectedRegionalId, this.selectedDivisionId)
      .subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          this.dataSource.data = response?.data || [];

          setTimeout(() => {
            this.paginator.length = response?.totalItems;
            this.paginator.pageIndex = response?.currentPage - 1;
          }, 100);
        },
        error: (e) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar("Erro ao carregar lista de eventos");
        },
      });
  }

  getRegionals() {
    if (!this.selectedCommandId) {
      return;
    }

    this.filterService.updateFilter({ eventListCommandId: this.selectedCommandId });

    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 100, this.selectedCommandId).subscribe({
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

  getDivisions() {
    this.filterService.updateFilter({ eventListRegionalId: this.selectedRegionalId });

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

  showParticipantsDialog(id: number) {
    this.dialog.open(EventParticipantDialogComponent, {
      width: "80%",
      data: {
        eventId: id,
      },
    });
  }
}

