import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonService } from 'src/app/core/services/person/person.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NGXLogger } from 'ngx-logger';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
    standalone: false,
  selector: 'app-person-late-payment-dialog',
  templateUrl: './person-late-payment-dialog.component.html',
  styleUrls: ['./person-late-payment-dialog.component.css']
})
export class PersonLatePaymentDialogComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  formGroup: FormGroup;
  latePayments: any[] = [];
  personId: number;
  totalItems: number = 0;
  pageSize: number = 5;
  currentPage: number = 0;
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
    this.personService.getPayments(this.personId, this.currentPage + 1, this.pageSize).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        setTimeout(() => {
            this.paginator.length = response?.totalItems;
            this.paginator.pageIndex = response?.currentPage - 1;
        }, 100);
        this.latePayments = response.data;
        this.totalItems = response.total;
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar('Erro ao carregar atrasos de mensalidade');
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPayments();
  }

  savePayment() {
    if (this.formGroup.valid) {
      this.blockUI.start('Salvando...');
      const payment = this.formGroup.value;
      this.personService.savePayment(this.personId, payment).subscribe({
        next: () => {
          this.blockUI.stop();
          this.notificationService.openSnackBar('Atraso de mensalidade salvo com sucesso');
          this.currentPage = 0;
          if (this.paginator) {
            this.paginator.firstPage();
          }
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
          let message = 'Erro ao salvar atraso de mensalidade';
          if (e?.status === 400 && e?.error?.errors?.length > 0) {
            message = e.error.errors.map((err: any) => err.msg).join(', ');
          } else if (e?.status === 409) {
            message = e?.error.error;
          }
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

