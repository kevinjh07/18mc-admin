import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraduationReportComponent } from './graduation-report.component';

describe('GraduationReportComponent', () => {
  let component: GraduationReportComponent;
  let fixture: ComponentFixture<GraduationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraduationReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraduationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
