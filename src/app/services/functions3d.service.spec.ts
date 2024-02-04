import { TestBed } from '@angular/core/testing';

import { Functions3dService } from './functions3d.service';

describe('Functions3dService', () => {
  let service: Functions3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Functions3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
