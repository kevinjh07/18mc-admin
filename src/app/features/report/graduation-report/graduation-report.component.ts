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
import { ptBR } from 'date-fns/locale';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  NativeDateAdapter,
} from '@angular/material/core';
import { GraduationReportPdfService } from './graduation-report-pdf.service';

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

export interface EventParticipation {
  id: number;
  title: string;
  date: string;
  eventType: 'social_action' | 'poll' | 'other';
  participated: boolean;
}

export interface LatePayment {
  year: number;
  month: number;
  paidAt: string | null;
}

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
  events: EventParticipation[];
  latePayments: LatePayment[];
}

export interface GraduationReportResponse {
  period: { start: string; end: string };
  data: GraduationScore[];
}

@Component({
    standalone: false,
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
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
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
  directorVotes: Map<number, number> = new Map();

  totalMembers = 0;
  avgScore = 0;
  perfectScoreCount = 0;

  displayedColumns: string[] = ['expand', 'position', 'fullName', 'socialAction', 'poll', 'otherEvents', 'payments', 'directorVote', 'totalScore'];
  expandedElement: GraduationScore | null = null;

  constructor(
    private fb: FormBuilder,
    private logger: NGXLogger,
    private commandService: CommandService,
    private regionalService: RegionalService,
    private divisionService: DivisionService,
    private reportService: ReportService,
    private notificationService: NotificationService,
    private titleService: Title,
    private pdfService: GraduationReportPdfService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Relatório de Graduação - 18 Admin');

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
        this.reportData = response.data;
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
      this.perfectScoreCount = this.reportData.filter((item) => item.totalScore === 4).length;
    } else {
      this.avgScore = 0;
      this.perfectScoreCount = 0;
    }
  }

  getScoreClass(score: number): string {
    if (score === 1) return 'score-success';
    return 'score-fail';
  }

  getPositionBadgeClass(score: number): string {
    if (score >= 3) return 'score-high';
    if (score === 2) return 'score-medium';
    if (score < 2) return 'score-low';
    return '';
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

  toggleVote(personId: number): void {
    if (this.directorVotes.has(personId)) {
      this.directorVotes.delete(personId);
    } else {
      this.directorVotes.set(personId, 1);
    }
  }

  hasVote(personId: number): boolean {
    return this.directorVotes.has(personId);
  }

  getAdjustedTotal(personId: number, totalScore: number): number {
    return totalScore + (this.directorVotes.has(personId) ? 1 : 0);
  }

  resetVotes(): void {
    this.directorVotes.clear();
  }

  toggleRow(element: GraduationScore, event: Event): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  getRowIndex(element: GraduationScore): number {
    return this.reportData.indexOf(element) + 1;
  }

  getEventsByType(events: EventParticipation[], type: string): EventParticipation[] {
    return events.filter(e => e.eventType === type);
  }

  getEventTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'social_action': 'Ações Sociais',
      'poll': 'Enquetes',
      'other': 'Outros Eventos'
    };
    return labels[type] || type;
  }

  getEventTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'social_action': 'diversity_3',
      'poll': 'poll',
      'other': 'event'
    };
    return icons[type] || 'event';
  }

  getEventTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'social_action': 'blue',
      'poll': 'purple',
      'other': 'orange'
    };
    return colors[type] || 'blue';
  }

  formatEventDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  }

  getMonthName(month: number): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[month - 1] || '';
  }

  exportToPdf(): void {
    if (!this.reportGenerated || this.reportData.length === 0) {
      this.notificationService.openSnackBar('Nenhum dado para exportar');
      return;
    }

    const commandFullName = this.commands.find(c => c.id === this.filterForm.get('commandId')?.value)?.name || 'Comando';
    const commandName = commandFullName.includes(' ') ? commandFullName.split(' ').slice(1).join(' ') : commandFullName;
    const regionalName = this.regionals.find(r => r.id === this.filterForm.get('regionalId')?.value)?.name || 'Regional';
    const divisionName = this.divisions.find(d => d.id === this.filterForm.get('divisionId')?.value)?.name || 'Divisão';

    this.pdfService.exportToPdf({
      reportData: this.reportData,
      directorVotes: this.directorVotes,
      reportPeriod: this.reportPeriod,
      totalMembers: this.totalMembers,
      avgScore: this.avgScore,
      perfectScoreCount: this.perfectScoreCount,
      commandName,
      regionalName,
      divisionName
    });
  }
}

