import { TestBed } from '@angular/core/testing';

import { RegionalService } from './regional.service';

describe('RegionalService', () => {
  let service: RegionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
