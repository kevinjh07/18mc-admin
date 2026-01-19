import { TestBed } from '@angular/core/testing';

import { SocialActionService } from './social-action.service';

describe('SocialActionService', () => {
  let service: SocialActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
