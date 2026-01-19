import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialActionListComponent } from './social-action-list.component';

describe('SocialActionListComponent', () => {
  let component: SocialActionListComponent;
  let fixture: ComponentFixture<SocialActionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialActionListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialActionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
