import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NGXLogger } from 'ngx-logger';
import { CommandService } from 'src/app/core/services/command/command.service';
import { RegionalService } from 'src/app/core/services/regional/regional.service';
import { DivisionService } from 'src/app/core/services/division/division.service';
import { ReportService } from 'src/app/core/services/report/report.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Regional } from 'src/app/core/models/regional';
import { Division } from 'src/app/core/models/division';
import { Title } from '@angular/platform-browser';
import { format } from 'date-fns';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  NativeDateAdapter,
} from '@angular/material/core';

export const DEFAULT_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export interface GraduationScore {
  personId: number;
  fullName: string;
  shortName: string;
  scores: {
    socialAction: number;
    poll: number;
    otherEvents: number;
    payments: number;
  };
  totalScore: number;
}

export interface GraduationReportResponse {
  period: { start: string; end: string };
  data: GraduationScore[];
}

@Component({
  selector: 'app-graduation-report',
  templateUrl: './graduation-report.component.html',
  styleUrls: ['./graduation-report.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: NativeDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: DEFAULT_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
})
export class GraduationReportComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  filterForm: FormGroup;
  commands: any[] = [];
  regionals: Regional[] = [];
  divisions: Division[] = [];

  reportData: GraduationScore[] = [];
  reportPeriod: { start: string; end: string } | null = null;
  reportGenerated = false;

  // Summary stats
  totalMembers = 0;
  avgScore = 0;
  maxScore = 0;
  perfectScoreCount = 0;

  displayedColumns: string[] = ['position', 'fullName', 'socialAction', 'poll', 'otherEvents', 'payments', 'totalScore'];

  constructor(
    private fb: FormBuilder,
    private logger: NGXLogger,
    private commandService: CommandService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private reportService: ReportService,
    private notificationService: NotificationService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Relatório de Graduação - 18 Admin');

    // Default dates: current year
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    this.filterForm = this.fb.group({
      commandId: [null, Validators.required],
      regionalId: [{ value: null, disabled: true }, Validators.required],
      divisionId: [{ value: null, disabled: true }, Validators.required],
      startDate: [startDate, Validators.required],
      endDate: [endDate, Validators.required],
    });

    this.loadCommands();
  }

  loadCommands(): void {
    this.commandService.getAll().subscribe({
      next: (commands) => {
        this.commands = commands;
      },
      error: (e) => {
        this.logger.error(e);
        this.notificationService.openSnackBar('Erro ao carregar comandos');
      },
    });
  }

  onCommandChange(): void {
    this.filterForm.get('regionalId')?.reset();
    this.filterForm.get('regionalId')?.disable();
    this.filterForm.get('divisionId')?.reset();
    this.filterForm.get('divisionId')?.disable();
    this.regionals = [];
    this.divisions = [];
    this.reportGenerated = false;

    const commandId = this.filterForm.get('commandId')?.value;
    if (commandId) {
      this.blockUI.start('Carregando regionais...');
      this.regionalService.getAll(1, 100, commandId).subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          this.regionals = response?.data || [];
          this.filterForm.get('regionalId')?.enable();
        },
        error: (e: any) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar('Erro ao carregar regionais');
        },
      });
    }
  }

  onRegionalChange(): void {
    this.filterForm.get('divisionId')?.reset();
    this.filterForm.get('divisionId')?.disable();
    this.divisions = [];
    this.reportGenerated = false;

    const regionalId = this.filterForm.get('regionalId')?.value;
    if (regionalId) {
      this.blockUI.start('Carregando divisões...');
      this.divisionService.getAllByRegionalId(regionalId).subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          this.divisions = response?.data || [];
          this.filterForm.get('divisionId')?.enable();
        },
        error: (e: any) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar('Erro ao carregar divisões');
        },
      });
    }
  }

  generateReport(): void {
    if (this.filterForm.invalid) {
      this.notificationService.openSnackBar('Preencha todos os campos obrigatórios');
      return;
    }

    const { divisionId, startDate, endDate } = this.filterForm.getRawValue();
    const formattedStartDate = format(startDate, 'dd/MM/yyyy');
    const formattedEndDate = format(endDate, 'dd/MM/yyyy');

    this.blockUI.start('Gerando relatório...');
    this.reportService.getGraduationScores(divisionId, formattedStartDate, formattedEndDate).subscribe({
      next: (response: GraduationReportResponse) => {
        this.blockUI.stop();
        this.reportData = response.data.sort((a, b) => b.totalScore - a.totalScore);
        this.reportPeriod = response.period;
        this.reportGenerated = true;
        this.calculateSummary();
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar('Erro ao gerar relatório');
      },
    });
  }

  calculateSummary(): void {
    this.totalMembers = this.reportData.length;
    if (this.totalMembers > 0) {
      const totalScoreSum = this.reportData.reduce((sum, item) => sum + item.totalScore, 0);
      this.avgScore = Math.round((totalScoreSum / this.totalMembers) * 10) / 10;
      this.maxScore = Math.max(...this.reportData.map((item) => item.totalScore));
      this.perfectScoreCount = this.reportData.filter((item) => item.totalScore === 4).length;
    } else {
      this.avgScore = 0;
      this.maxScore = 0;
      this.perfectScoreCount = 0;
    }
  }

  getScoreClass(score: number): string {
    if (score === 1) return 'score-success';
    return 'score-fail';
  }

  getTotalScoreClass(score: number): string {
    if (score === 4) return 'total-excellent';
    if (score >= 3) return 'total-good';
    if (score >= 2) return 'total-average';
    return 'total-low';
  }

  getProgressValue(score: number): number {
    return (score / 4) * 100;
  }

  exportToPdf(): void {
    if (!this.reportGenerated || this.reportData.length === 0) {
      this.notificationService.openSnackBar('Nenhum dado para exportar');
      return;
    }

    const divisionName = this.divisions.find(d => d.id === this.filterForm.get('divisionId')?.value)?.name || 'Divisão';

    // Create print content
    const printContent = this.generatePrintContent(divisionName);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  generatePrintContent(divisionName: string): string {
    let tableRows = '';
    this.reportData.forEach((item, index) => {
      tableRows += `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${item.fullName}</td>
          <td style="text-align: center;">${item.scores.socialAction === 1 ? '✓' : '✗'}</td>
          <td style="text-align: center;">${item.scores.poll === 1 ? '✓' : '✗'}</td>
          <td style="text-align: center;">${item.scores.otherEvents === 1 ? '✓' : '✗'}</td>
          <td style="text-align: center;">${item.scores.payments === 1 ? '✓' : '✗'}</td>
          <td style="text-align: center; font-weight: bold;">${item.totalScore}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Graduação - ${divisionName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #3f51b5; }
          h3 { color: #666; }
          .period { text-align: center; margin-bottom: 20px; color: #666; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 20px; }
          .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
          .summary-card h4 { margin: 0; color: #666; font-size: 12px; }
          .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #3f51b5; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; }
          th { background-color: #3f51b5; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Relatório de Graduação</h1>
        <h3 style="text-align: center;">${divisionName}</h3>
        <p class="period">Período: ${this.reportPeriod?.start} a ${this.reportPeriod?.end}</p>

        <div class="summary">
          <div class="summary-card">
            <h4>Total de Integrantes</h4>
            <p>${this.totalMembers}</p>
          </div>
          <div class="summary-card">
            <h4>Média de Pontos</h4>
            <p>${this.avgScore}</p>
          </div>
          <div class="summary-card">
            <h4>Pontuação Máxima</h4>
            <p>${this.maxScore}</p>
          </div>
          <div class="summary-card">
            <h4>Integrantes com 4 Pontos</h4>
            <p>${this.perfectScoreCount}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Nome</th>
              <th style="width: 100px;">Ação Social</th>
              <th style="width: 100px;">Enquete</th>
              <th style="width: 100px;">Eventos</th>
              <th style="width: 100px;">Mensalidade</th>
              <th style="width: 80px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <p class="footer">Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
      </body>
      </html>
    `;
  }
}
