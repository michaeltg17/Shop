import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CarrierService } from './carrier.service';
import { Carrier } from './carrier';

describe('CarrierService', () => {
  let service: CarrierService;
  let httpMock: HttpTestingController;

  const mockCarrier: Carrier = {
    id: 1,
    name: 'Test Carrier',
    trackingUrl: 'https://example.com/tracking',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CarrierService],
    });
    service = TestBed.inject(CarrierService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty carriers', () => {
    expect(service.carriers()).toEqual([]);
  });

  it('should initialize with loading false', () => {
    expect(service.loading()).toBe(false);
  });

  it('should initialize with no error', () => {
    expect(service.error()).toBe(null);
  });

  it('should load carriers from API', () => {
    service.loadCarriers();
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne('api/carriers');
    expect(req.request.method).toBe('GET');
    req.flush([mockCarrier]);

    expect(service.loading()).toBe(false);
    expect(service.carriers()).toEqual([mockCarrier]);
  });

  it('should handle load carriers error', () => {
    service.loadCarriers();
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne('api/carriers');
    req.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('Failed to load carriers');
  });

  it('should add a carrier', () => {
    service.loadCarriers();
    const loadReq = httpMock.expectOne('api/carriers');
    loadReq.flush([]);

    service.addCarrier(mockCarrier);

    const addReq = httpMock.expectOne('api/carriers');
    expect(addReq.request.method).toBe('POST');
    expect(addReq.request.body).toEqual(mockCarrier);
    addReq.flush(mockCarrier);

    expect(service.carriers()).toContain(mockCarrier);
  });

  it('should handle add carrier error', () => {
    service.loadCarriers();
    const loadReq = httpMock.expectOne('api/carriers');
    loadReq.flush([]);

    service.addCarrier(mockCarrier);

    const addReq = httpMock.expectOne('api/carriers');
    addReq.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Failed to add carrier');
  });

  it('should update a carrier', () => {
    service.loadCarriers();
    const loadReq = httpMock.expectOne('api/carriers');
    loadReq.flush([mockCarrier]);

    const updatedCarrier: Carrier = { ...mockCarrier, name: 'Updated Carrier' };
    service.updateCarrier(updatedCarrier);

    const updateReq = httpMock.expectOne(`api/carriers/${mockCarrier.id}`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(updatedCarrier);
    updateReq.flush(updatedCarrier);

    expect(service.carriers()[0].name).toBe('Updated Carrier');
  });

  it('should handle update carrier error', () => {
    service.loadCarriers();
    const loadReq = httpMock.expectOne('api/carriers');
    loadReq.flush([mockCarrier]);

    const updatedCarrier: Carrier = { ...mockCarrier, name: 'Updated Carrier' };
    service.updateCarrier(updatedCarrier);

    const updateReq = httpMock.expectOne(`api/carriers/${mockCarrier.id}`);
    updateReq.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Failed to update carrier');
  });

  it('should delete a carrier', () => {
    const carriers: Carrier[] = [mockCarrier, { ...mockCarrier, id: 2, name: 'Other Carrier' }];
    service.loadCarriers();
    const loadReq = httpMock.expectOne('api/carriers');
    loadReq.flush(carriers);

    service.deleteCarrier(mockCarrier.id);

    const deleteReq = httpMock.expectOne(`api/carriers/${mockCarrier.id}`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    expect(service.carriers()).not.toContain(mockCarrier);
  });

  it('should handle delete carrier error', () => {
    service.loadCarriers();
    const loadReq = httpMock.expectOne('api/carriers');
    loadReq.flush([mockCarrier]);

    service.deleteCarrier(mockCarrier.id);

    const deleteReq = httpMock.expectOne(`api/carriers/${mockCarrier.id}`);
    deleteReq.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Failed to delete carrier');
  });
});
