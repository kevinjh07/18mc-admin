import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Title } from "@angular/platform-browser";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { CommandService } from "src/app/core/services/command/command.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";

@Component({
    standalone: false,
  selector: "app-regional-list",
  templateUrl: "./regional-list.component.html",
  styleUrls: ["./regional-list.component.css"],
})
export class RegionalListComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["name", "actions"];
  dataSource = new MatTableDataSource<any>([]);
  commands: any = [];
  selectedCommandId: number | null = null;

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private logger: NGXLogger,
    private notificationService: NotificationService,
    private regionalService: RegionalService,
    private commandService: CommandService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Regionais - 18 Admin");
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.getCommands();
  }

  getCommands() {
    this.commandService.getAll().subscribe({
      next: (response: any) => {
        this.commands = response;
      },
      error: (e) => {
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao obter lista de comandos, tente novamente");
      },
    });
  }

  getRegionals() {
    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(this.paginator.pageIndex + 1, this.paginator.pageSize, this.selectedCommandId).subscribe({
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
        this.notificationService.openSnackBar("Erro ao carregar lista de regionais");
      },
    });
  }
}

