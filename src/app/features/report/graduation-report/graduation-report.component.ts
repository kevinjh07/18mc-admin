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
    private titleService: Title
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

    const printContent = this.generatePrintContent(commandName, regionalName, divisionName);
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

  generatePrintContent(commandName: string, regionalName: string, divisionName: string): string {
    let memberDetails = '';
    this.reportData.forEach((item, index) => {
      const hasVote = this.directorVotes.has(item.personId);
      const adjustedTotal = item.totalScore + (hasVote ? 1 : 0);

      const socialActions = item.events?.filter(e => e.eventType === 'social_action') || [];
      const polls = item.events?.filter(e => e.eventType === 'poll') || [];
      const otherEvents = item.events?.filter(e => e.eventType === 'other') || [];

      let eventsHtml = '';

      if (socialActions.length > 0) {
        eventsHtml += `
          <div class="event-group">
            <div class="event-group-title">🤝 Ações Sociais</div>
            ${socialActions.map(e => `
              <div class="event-item">
                <span class="${e.participated ? 'check' : 'cross'}">${e.participated ? '✓' : '✗'}</span>
                <span>${e.title}</span>
                <span class="event-date">${format(new Date(e.date), 'dd/MM/yyyy')}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (polls.length > 0) {
        eventsHtml += `
          <div class="event-group">
            <div class="event-group-title">📊 Enquetes</div>
            ${polls.map(e => `
              <div class="event-item">
                <span class="${e.participated ? 'check' : 'cross'}">${e.participated ? '✓' : '✗'}</span>
                <span>${e.title}</span>
                <span class="event-date">${format(new Date(e.date), 'dd/MM/yyyy')}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (otherEvents.length > 0) {
        eventsHtml += `
          <div class="event-group">
            <div class="event-group-title">📅 Outros Eventos</div>
            ${otherEvents.map(e => `
              <div class="event-item">
                <span class="${e.participated ? 'check' : 'cross'}">${e.participated ? '✓' : '✗'}</span>
                <span>${e.title}</span>
                <span class="event-date">${format(new Date(e.date), 'dd/MM/yyyy')}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      let paymentsHtml = '';
      if (!item.latePayments || item.latePayments.length === 0) {
        paymentsHtml = `<div class="no-late-payment">✅ Nenhum atraso de mensalidade registrado</div>`;
      } else {
        paymentsHtml = `
          <div class="late-payments">
            ${item.latePayments.map(p => `
              <div class="late-payment-item">
                <span class="warning">⚠️</span>
                <span>${this.getMonthName(p.month)}/${p.year}</span>
                <span class="payment-status">${p.paidAt ? 'Pago em atraso: ' + format(new Date(p.paidAt), 'dd/MM/yyyy') : 'Pendente'}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      let badgeColor = '#e0e0e0';
      let badgeTextColor = '#666';
      if (adjustedTotal >= 3) {
        badgeColor = '#4caf50';
        badgeTextColor = 'white';
      } else if (adjustedTotal === 2) {
        badgeColor = '#ffc107';
        badgeTextColor = '#5d4e00';
      } else {
        badgeColor = '#f44336';
        badgeTextColor = 'white';
      }

      const isLastItem = index === this.reportData.length - 1;

      memberDetails += `
        <div class="member-card${isLastItem ? ' last-member-card' : ''}">
          <div class="member-header">
            <div class="member-position" style="background: ${badgeColor}; color: ${badgeTextColor};">${index + 1}</div>
            <div class="member-name">
              <strong>${item.shortName}</strong>
              <span class="full-name">${item.fullName}</span>
            </div>
            <div class="member-scores">
              <span class="${item.scores.socialAction === 1 ? 'check' : 'cross'}" title="Ação Social">${item.scores.socialAction === 1 ? '✓' : '✗'}</span>
              <span class="${item.scores.poll === 1 ? 'check' : 'cross'}" title="Enquete">${item.scores.poll === 1 ? '✓' : '✗'}</span>
              <span class="${item.scores.otherEvents === 1 ? 'check' : 'cross'}" title="Eventos">${item.scores.otherEvents === 1 ? '✓' : '✗'}</span>
              <span class="${item.scores.payments === 1 ? 'check' : 'cross'}" title="Mensalidade">${item.scores.payments === 1 ? '✓' : '✗'}</span>
              <span class="${hasVote ? 'vote-yes' : 'vote-no'}" title="Voto Diretor">${hasVote ? '👍' : '-'}</span>
            </div>
            <div class="member-total" style="background: ${badgeColor}; color: ${badgeTextColor};">
              ${adjustedTotal}
            </div>
          </div>
          <div class="member-details">
            <div class="events-section">
              <h5>📋 Participação em Eventos</h5>
              ${eventsHtml || '<div class="no-events">Nenhum evento no período</div>'}
            </div>
            <div class="payments-section">
              <h5>💰 Situação de Mensalidades</h5>
              ${paymentsHtml}
            </div>
          </div>
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Graduação - ${divisionName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; position: relative; }
          h1 { text-align: center; color: #3f51b5; margin-bottom: 5px; }
          .logo { position: absolute; top: 10px; right: 10px; width: 60px; height: 60px; }
          .header-info { text-align: center; margin-bottom: 10px; }
          .header-info span { color: #666; font-size: 14px; }
          .period { text-align: center; margin-bottom: 20px; color: #666; }

          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .summary-card { background: #f5f5f5; padding: 15px 25px; border-radius: 8px; text-align: center; }
          .summary-card h4 { margin: 0; color: #666; font-size: 12px; }
          .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #3f51b5; }

          .legend { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 8px; }
          .legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #666; }

          .member-card { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; overflow: hidden; page-break-inside: avoid; }
          .member-header { display: flex; align-items: center; gap: 15px; padding: 12px 15px; background: #f5f5f5; }
          .member-position { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
          .member-name { flex: 1; }
          .member-name strong { display: block; font-size: 14px; }
          .member-name .full-name { font-size: 11px; color: #999; }
          .member-scores { display: flex; gap: 8px; font-size: 16px; }
          .member-total { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; }

          .check { color: #4caf50; }
          .cross { color: #f44336; }
          .vote-yes { color: #3f51b5; }
          .vote-no { color: #999; }

          .member-details { display: flex; gap: 20px; padding: 15px; background: white; }
          .events-section, .payments-section { flex: 1; }
          .events-section h5, .payments-section h5 { margin: 0 0 10px 0; font-size: 13px; color: #333; }

          .event-group { margin-bottom: 10px; }
          .event-group-title { font-weight: 600; font-size: 12px; margin-bottom: 5px; }
          .event-item { display: flex; align-items: center; gap: 8px; font-size: 11px; padding: 3px 0; }
          .event-date { color: #999; margin-left: auto; }

          .no-late-payment { font-size: 12px; }
          .no-events { color: #999; font-size: 12px; font-style: italic; }
          .late-payment-item { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 5px 0; }
          .payment-status { color: #999; margin-left: auto; }
          .warning { font-size: 14px; }

          .footer {
            margin-top: 30px;
            text-align: center;
            color: #999;
            font-size: 12px;
            page-break-before: avoid;
            break-before: avoid;
          }

          .last-member-card {
            page-break-after: avoid;
            break-after: avoid;
          }

          @media print {
            .member-card { page-break-inside: avoid; }
            .footer { page-break-before: avoid !important; break-before: avoid !important; }
            .last-member-card { page-break-after: avoid !important; break-after: avoid !important; }
          }

          @page {
            margin: 20mm 15mm 25mm 15mm;
            @bottom-right {
              content: "Página " counter(page) " de " counter(pages);
              font-size: 10px;
              color: #999;
            }
          }

          .page-number {
            position: fixed;
            bottom: 10px;
            right: 20px;
            font-size: 10px;
            color: #999;
          }
        </style>
        <script>
          // Fallback for browsers that don't support @page counters
          window.onload = function() {
            var totalPages = Math.ceil(document.body.scrollHeight / 1123); // A4 height in pixels at 96dpi
            var pageNumEl = document.querySelector('.page-number-fallback');
            if (pageNumEl) {
              pageNumEl.style.display = 'none'; // Hide fallback if @page works
            }
          };
        </script>
      </head>
      <body>
        <img src="${window.location.origin}/assets/favicon/android-icon-192x192.png" alt="Logo" class="logo" />
        <h1>Relatório de Graduação</h1>
        <div class="header-info">
          <span><strong>Comando:</strong> ${commandName}</span> |
          <span><strong>Regional:</strong> ${regionalName}</span> |
          <span><strong>Divisão:</strong> ${divisionName}</span>
        </div>
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
            <h4>Integrantes com 4 Pontos</h4>
            <p>${this.perfectScoreCount}</p>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item">🤝 Ação Social</div>
          <div class="legend-item">📊 Enquete</div>
          <div class="legend-item">📅 Eventos</div>
          <div class="legend-item">💰 Mensalidade</div>
          <div class="legend-item">👍 Voto Diretor</div>
        </div>

        ${memberDetails}

        <p class="footer">Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        <div class="page-number"></div>
      </body>
      </html>
    `;
  }
}
