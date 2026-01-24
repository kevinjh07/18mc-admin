import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonService } from 'src/app/core/services/person/person.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-person-late-payment-dialog',
  templateUrl: './person-late-payment-dialog.component.html',
  styleUrls: ['./person-late-payment-dialog.component.css']
})
export class PersonLatePaymentDialogComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  formGroup: FormGroup;
  latePayments: any[] = [];
  personId: number;
  months = [
    { value: 1, name: 'Janeiro' },
    { value: 2, name: 'Fevereiro' },
    { value: 3, name: 'Março' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Maio' },
    { value: 6, name: 'Junho' },
    { value: 7, name: 'Julho' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Setembro' },
    { value: 10, name: 'Outubro' },
    { value: 11, name: 'Novembro' },
    { value: 12, name: 'Dezembro' }
  ];

  constructor(
    private dialogRef: MatDialogRef<PersonLatePaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { personId: number },
    private fb: FormBuilder,
    private personService: PersonService,
    private notificationService: NotificationService,
    private logger: NGXLogger
  ) {
    this.personId = data.personId;
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      month: [new Date().getMonth() + 1, Validators.required],
      paidAt: [new Date().toISOString()],
      notes: ['', Validators.maxLength(255)],
    });
    this.loadPayments();
  }

  loadPayments() {
    this.blockUI.start('Carregando atrasos de mensalidade...');
    this.personService.getPayments(this.personId).subscribe({
      next: (payments) => {
        this.blockUI.stop();
        this.latePayments = payments;
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar('Erro ao carregar atrasos de mensalidade');
      }
    });
  }

  savePayment() {
    if (this.formGroup.valid) {
      this.blockUI.start('Salvando...');
      const payment = this.formGroup.value;
      this.personService.savePayment(this.personId, payment).subscribe({
        next: () => {
          this.blockUI.stop();
          this.notificationService.openSnackBar('Atraso de mensalidade salvo com sucesso');
          this.loadPayments();
          this.formGroup.reset({
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            paidOnTime: true,
            paidAt: new Date().toISOString()
          });
        },
        error: (e) => {
          this.blockUI.stop();
          this.logger.error(e);
          const message = e?.status === 409 ? e?.error.error : 'Erro ao salvar atraso de mensalidade';
          this.notificationService.openSnackBar(message);
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  getMonthName(month: number): string {
    const monthObj = this.months.find(m => m.value === month);
    return monthObj ? monthObj.name : '';
  }
}
