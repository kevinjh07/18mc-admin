import { Component, OnInit } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ChartService } from "src/app/core/services/chart/chart.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { RegionalService } from "src/app/core/services/regional/regional.service";
import { Regional } from "src/app/core/models/regional";
import { subMonths, format } from "date-fns";
import { FilterService } from "src/app/core/services/filter/filter.service";
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  NativeDateAdapter,
} from "@angular/material/core";
import { Division } from "src/app/core/models/division";
import { DivisionService } from "src/app/core/services/division/division.service";
import { ChartItem } from "src/app/core/models/chartItem";
import { Title } from "@angular/platform-browser";
import { LegendPosition } from "@swimlane/ngx-charts";
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
  selector: "app-dashboard-home",
  templateUrl: "./dashboard-home.component.html",
  styleUrls: ["./dashboard-home.component.css"],
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
export class DashboardHomeComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  commands: any = [];
  regionals: Regional[] = [];
  divisions: Division[] = [];
  selectedCommandId: number;
  selectedRegionalId: number;
  selectedDivisionId: number | null = null;
  selectedStartDate: any;
  selectedEndDate: any;
  socialActions: ChartItem[] | null = null;
  socialActionsByType: ChartItem[] | null = null;
  socialActionsByPerson: any[] | null = null;
  totalSocialActions: number = 0;
  totalSocialActionsByType: number = 0;
  legendPosition: LegendPosition.Right;

  constructor(
    private logger: NGXLogger,
    private chartService: ChartService,
    private notificationService: NotificationService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private commandService: CommandService,
    private filterService: FilterService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle("Dashboard - 18 Admin");
  }

  ngAfterViewInit(): void {
    this.getCommands();

    this.selectedStartDate = subMonths(new Date(), 6);
    this.selectedEndDate = new Date();

    const filter = this.filterService.getFilter();
    if (filter.dashboardCommandlId) {
      this.selectedCommandId = filter.dashboardCommandlId;
      if (filter.dashboardRegionalId) {
        this.selectedRegionalId = filter.dashboardRegionalId;
        this.getDivisions();
        this.getSocialActionCountByDateRange();
        this.getSocialActionByTypeCountByDateRange();

        if (filter.dashboardDivisionId) {
          this.selectedDivisionId = filter.dashboardDivisionId;
          this.getSocialActionsByPersonAndDivision();
        }
      }
    }
  }

  getRegionals() {
    this.filterService.updateFilter({
      dashboardCommandlId: this.selectedCommandId,
    });

    this.blockUI.start("Aguarde...");
    this.regionalService.getAll(1, 30, null).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.regionals = response?.data || [];
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar(
          "Erro ao carregar lista de regionais"
        );
      },
    });
  }

  getDivisions() {
    this.blockUI.start("Aguarde...");
    this.divisionService.getAllByRegionalId(this.selectedRegionalId).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.divisions = response?.data || [];
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar(
          "Erro ao carregar lista de divisões"
        );
      },
    });
  }

  getSocialActionCountByDateRange() {
    this.filterService.updateFilter({
      dashboardRegionalId: this.selectedRegionalId,
    });
    this.blockUI.start("Aguarde...");

    this.chartService
      .getSocialActionCountByDateRange(
        format(this.selectedStartDate, "yyyy-MM-dd"),
        format(this.selectedEndDate, "yyyy-MM-dd"),
        this.selectedRegionalId
      )
      .subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          this.socialActions = null;
          setTimeout(() => {
            this.socialActions = response || [];
            this.totalSocialActions = this.sumSocialActions(
              this.socialActions
            );
          }, 500);
        },
        error: (e) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar(
            "Erro ao carregar gráfico de ações sociais"
          );
        },
      });
  }

  getSocialActionByTypeCountByDateRange() {
    this.filterService.updateFilter({
      dashboardRegionalId: this.selectedRegionalId,
    });
    this.blockUI.start("Aguarde...");

    this.chartService
      .getSocialActionByTypeCountByDateRange(
        format(this.selectedStartDate, "yyyy-MM-dd"),
        format(this.selectedEndDate, "yyyy-MM-dd"),
        this.selectedRegionalId
      )
      .subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          this.socialActions = null;
          setTimeout(() => {
            this.socialActionsByType = response || [];
            this.totalSocialActionsByType = this.sumSocialActionsByType(
              this.socialActionsByType
            );
          }, 500);
        },
        error: (e) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar(
            "Erro ao carregar gráfico de ações sociais"
          );
        },
      });
  }

  getSocialActionsByPersonAndDivision() {
    if (!this.selectedDivisionId) {
      return;
    }

    this.filterService.updateFilter({
      dashboardDivisionId: this.selectedDivisionId,
    });
    this.blockUI.start("Aguarde...");

    this.chartService
      .getSocialActionsByPersonAndDivision(
        format(this.selectedStartDate, "yyyy-MM-dd"),
        format(this.selectedEndDate, "yyyy-MM-dd"),
        this.selectedDivisionId
      )
      .subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          this.socialActionsByPerson = null;
          setTimeout(() => {
            this.socialActionsByPerson = response || [];
          }, 500);
        },
        error: (e) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar(
            "Erro ao carregar gráfico de ações sociais por integrante"
          );
        },
      });
  }

  regionalSelecionChanged() {
    this.getDivisions();
    this.getSocialActionCountByDateRange();
    this.getSocialActionByTypeCountByDateRange();
    this.socialActionsByPerson = null;
    this.selectedDivisionId = null;
  }

  sumSocialActions(socialActions: ChartItem[] | null) {
    if (!socialActions) {
      return 0;
    }

    return socialActions.reduce((acc, item) => acc + item.value, 0);
  }

  sumSocialActionsByType(socialActions: any[] | null) {
    if (!socialActions) {
      return 0;
    }

    return socialActions.reduce(
      (acc, item) => acc + (item.series[0].value + item.series[1].value),
      0
    );
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
