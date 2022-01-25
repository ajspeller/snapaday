import { TestBed } from '@angular/core/testing';

import { SimpleAlertService } from './simple-alert.service';

describe('SimpleAlertService', () => {
  let service: SimpleAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
