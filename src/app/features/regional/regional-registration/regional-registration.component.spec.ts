import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalRegistrationComponent } from './regional-registration.component';

describe('RegionalRegistrationComponent', () => {
  let component: RegionalRegistrationComponent;
  let fixture: ComponentFixture<RegionalRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegionalRegistrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionalRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
