import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Title } from "@angular/platform-browser";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Regional } from "src/app/core/models/regional";
import { CommandService } from "src/app/core/services/command/command.service";
import { DivisionService } from "src/app/core/services/division/division.service";
import { FilterService } from "src/app/core/services/filter/filter.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";

@Component({
  selector: "app-division-list",
  templateUrl: "./division-list.component.html",
  styleUrls: ["./division-list.component.css"],
})
export class DivisionListComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["name", "actions"];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  regionals: Regional[] = [];
  commands: any = [];
  selectedRegionalId: number;
  selectedCommandId: number;

  constructor(
    private logger: NGXLogger,
    private notificationService: NotificationService,
    private divisionService: DivisionService,
    private regionalService: RegionalService,
    private commandService: CommandService,
    private filterService: FilterService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Divisões - 18 Admin");
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.getCommands();

    const filter = this.filterService.getFilter();
    if (filter.divisionListCommandId) {
      this.selectedCommandId = filter.divisionListCommandId;
      if (filter.divisionListRegionalId) {
        this.selectedRegionalId = filter.divisionListRegionalId;
        this.getDivisions();
      }
    }
  }

  getDivisions() {
    this.filterService.updateFilter({ divisionListRegionalId: this.selectedRegionalId });

    this.blockUI.start("Aguarde...");
    this.divisionService
      .getAll(this.paginator.pageIndex + 1, this.paginator.pageSize, this.selectedRegionalId)
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
          this.notificationService.openSnackBar("Erro ao carregar lista de divisões");
        },
      });
  }

  getRegionals() {
    this.filterService.updateFilter({ divisionListCommandId: this.selectedCommandId });

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
