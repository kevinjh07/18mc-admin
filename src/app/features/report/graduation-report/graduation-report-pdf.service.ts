import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { GraduationScore, LatePayment } from './graduation-report.component';

export interface GraduationPdfData {
  reportData: GraduationScore[];
  directorVotes: Map<number, number>;
  reportPeriod: { start: string; end: string } | null;
  totalMembers: number;
  avgScore: number;
  perfectScoreCount: number;
  commandName: string;
  regionalName: string;
  divisionName: string;
}

@Injectable({
  providedIn: 'root'
})
export class GraduationReportPdfService {

  constructor() { }

  exportToPdf(data: GraduationPdfData): void {
    const printContent = this.generatePrintContent(data);
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

  private generatePrintContent(data: GraduationPdfData): string {
    const memberDetails = this.generateMemberDetails(data);
    return this.generateHtmlDocument(data, memberDetails);
  }

  private generateMemberDetails(data: GraduationPdfData): string {
    let memberDetails = '';

    data.reportData.forEach((item, index) => {
      const hasVote = data.directorVotes.has(item.personId);
      const adjustedTotal = item.totalScore + (hasVote ? 1 : 0);
      const isLastItem = index === data.reportData.length - 1;

      const eventsHtml = this.generateEventsHtml(item);
      const paymentsHtml = this.generatePaymentsHtml(item.latePayments);
      const { badgeColor, badgeTextColor } = this.getBadgeColors(adjustedTotal);

      memberDetails += this.generateMemberCard({
        item,
        index,
        hasVote,
        adjustedTotal,
        isLastItem,
        eventsHtml,
        paymentsHtml,
        badgeColor,
        badgeTextColor
      });
    });

    return memberDetails;
  }

  private generateEventsHtml(item: GraduationScore): string {
    const socialActions = item.events?.filter(e => e.eventType === 'social_action') || [];
    const polls = item.events?.filter(e => e.eventType === 'poll') || [];
    const otherEvents = item.events?.filter(e => e.eventType === 'other') || [];

    let eventsHtml = '';

    if (socialActions.length > 0) {
      eventsHtml += this.generateEventGroup('🤝 Ações Sociais', socialActions);
    }

    if (polls.length > 0) {
      eventsHtml += this.generateEventGroup('📊 Enquetes', polls);
    }

    if (otherEvents.length > 0) {
      eventsHtml += this.generateEventGroup('📅 Outros Eventos', otherEvents);
    }

    return eventsHtml;
  }

  private generateEventGroup(title: string, events: any[]): string {
    return `
      <div class="event-group">
        <div class="event-group-title">${title}</div>
        ${events.map(e => `
          <div class="event-item">
            <span class="${e.participated ? 'check' : 'cross'}">${e.participated ? '✓' : '✗'}</span>
            <span>${e.title}</span>
            <span class="event-date">${format(new Date(e.date), 'dd/MM/yyyy')}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private generatePaymentsHtml(latePayments: LatePayment[] | undefined): string {
    if (!latePayments || latePayments.length === 0) {
      return `<div class="no-late-payment">✅ Nenhum atraso de mensalidade registrado</div>`;
    }

    return `
      <div class="late-payments">
        ${latePayments.map(p => `
          <div class="late-payment-item">
            <span class="warning">⚠️</span>
            <span>${this.getMonthName(p.month)}/${p.year}</span>
            <span class="payment-status">${p.paidAt ? 'Pago em atraso: ' + format(new Date(p.paidAt), 'dd/MM/yyyy') : 'Pendente'}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private getBadgeColors(adjustedTotal: number): { badgeColor: string; badgeTextColor: string } {
    if (adjustedTotal >= 3) {
      return { badgeColor: '#4caf50', badgeTextColor: 'white' };
    } else if (adjustedTotal === 2) {
      return { badgeColor: '#ffc107', badgeTextColor: '#5d4e00' };
    } else {
      return { badgeColor: '#f44336', badgeTextColor: 'white' };
    }
  }

  private generateMemberCard(params: {
    item: GraduationScore;
    index: number;
    hasVote: boolean;
    adjustedTotal: number;
    isLastItem: boolean;
    eventsHtml: string;
    paymentsHtml: string;
    badgeColor: string;
    badgeTextColor: string;
  }): string {
    const { item, index, hasVote, adjustedTotal, isLastItem, eventsHtml, paymentsHtml, badgeColor, badgeTextColor } = params;

    return `
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
            <span class="vote-badge ${hasVote ? 'vote-yes' : 'vote-no'}" title="Voto Diretor">${hasVote ? '👍 +1' : '—'}</span>
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
  }

  private generateHtmlDocument(data: GraduationPdfData, memberDetails: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Graduação - ${data.divisionName}</title>
        <style>
          ${this.getDocumentStyles()}
        </style>
        <script>
          window.onload = function() {
            var totalPages = Math.ceil(document.body.scrollHeight / 1123);
            var pageNumEl = document.querySelector('.page-number-fallback');
            if (pageNumEl) {
              pageNumEl.style.display = 'none';
            }
          };
        </script>
      </head>
      <body>
        <img src="${window.location.origin}/assets/favicon/android-icon-192x192.png" alt="Logo" class="logo" />
        <h1>Relatório de Graduação</h1>
        <div class="header-info">
          <span><strong>Comando:</strong> ${data.commandName}</span> |
          <span><strong>Regional:</strong> ${data.regionalName}</span> |
          <span><strong>Divisão:</strong> ${data.divisionName}</span>
        </div>
        <p class="period">Período: ${data.reportPeriod?.start} a ${data.reportPeriod?.end}</p>

        <div class="summary">
          <div class="summary-card">
            <h4>Total de Integrantes</h4>
            <p>${data.totalMembers}</p>
          </div>
          <div class="summary-card">
            <h4>Média de Pontos</h4>
            <p>${data.avgScore}</p>
          </div>
          <div class="summary-card">
            <h4>Integrantes com 4 Pontos</h4>
            <p>${data.perfectScoreCount}</p>
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

  private getDocumentStyles(): string {
    return `
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
      .vote-badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
      .vote-yes { background: #e8eaf6; color: #3f51b5; border: 1px solid #3f51b5; }
      .vote-no { background: #f5f5f5; color: #bbb; border: 1px solid #ddd; }

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
    `;
  }

  private getMonthName(month: number): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || '';
  }
}
