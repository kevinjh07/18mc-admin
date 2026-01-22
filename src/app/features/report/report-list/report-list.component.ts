import { Component, OnInit } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, NativeDateAdapter } from "@angular/material/core";
import { Title } from "@angular/platform-browser";
import { subMonths, format } from "date-fns";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { Regional } from "src/app/core/models/regional";
import { CommandService } from "src/app/core/services/command/command.service";
import { FilterService } from "src/app/core/services/filter/filter.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";
import { ReportService } from "src/app/core/services/report/report.service";

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
  selector: "app-report-list",
  templateUrl: "./report-list.component.html",
  styleUrls: ["./report-list.component.css"],

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
export class ReportListComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  commands: any = [];
  regionals: Regional[] = [];
  selectedCommandId: number;
  selectedRegionalId: number;
  selectedDivisionId: number | null = null;
  selectedStartDate: any;
  selectedEndDate: any;
  data: any[] = [];

  constructor(
    private titleService: Title,
    private filterService: FilterService,
    private regionalService: RegionalService,
    private reportService: ReportService,
    private notificationService: NotificationService,
    private commandService: CommandService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Relatório - 18 MC Admin");
  }

  ngAfterViewInit(): void {
    this.getCommands();

    this.selectedStartDate = subMonths(new Date(), 6);
    this.selectedEndDate = new Date();

    const filter = this.filterService.getFilter();
    if (filter.dashboardCommandlId) {
      this.selectedCommandId = filter.dashboardCommandlId;
      this.getRegionals();
      if (filter.dashboardRegionalId) {
        this.selectedRegionalId = filter.dashboardRegionalId;
        this.getReport();
      }
    }
  }

  getRegionals() {
    this.filterService.updateFilter({ dashboardCommandlId: this.selectedCommandId });

    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 30, null).subscribe({
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

  regionalSelecionChanged() {
    this.getReport();
  }

  getReport() {
    this.filterService.updateFilter({ dashboardRegionalId: this.selectedRegionalId });
    this.blockUI.start("Aguarde...");

    this.reportService
      .getDivisionReport(
        this.selectedRegionalId,
        format(this.selectedStartDate, "yyyy-MM-dd"),
        format(this.selectedEndDate, "yyyy-MM-dd")
      )
      .subscribe({
        next: (response: any) => {
          this.data = response || [];
        },
        error: (e) => {
          this.logger.error(e);
          this.notificationService.openSnackBar("Erro ao carregar relatório");
        },
      })
      .add(() => this.blockUI.stop());
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
