import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { Customer } from './customer';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  const mockCustomer: Customer = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    isActive: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService],
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty customers', () => {
    expect(service.customers()).toEqual([]);
  });

  it('should initialize with loading false', () => {
    expect(service.loading()).toBe(false);
  });

  it('should initialize with no error', () => {
    expect(service.error()).toBe(null);
  });

  it('should load customers from API', () => {
    service.loadCustomers();
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne('api/customers');
    expect(req.request.method).toBe('GET');
    req.flush([mockCustomer]);

    expect(service.loading()).toBe(false);
    expect(service.customers()).toEqual([mockCustomer]);
  });

  it('should not reload customers if already loaded', () => {
    service.loadCustomers();
    const req = httpMock.expectOne('api/customers');
    req.flush([mockCustomer]);

    service.loadCustomers();
    httpMock.expectNone('api/customers');
  });

  it('should handle load customers error', () => {
    service.loadCustomers();
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne('api/customers');
    req.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('Failed to load customers');
  });

  it('should convert string isActive to boolean', () => {
    const customerWithStringActive: Customer = {
      ...mockCustomer,
      isActive: 'true' as unknown as boolean,
    };

    service.loadCustomers();
    const req = httpMock.expectOne('api/customers');
    req.flush([customerWithStringActive]);

    expect(service.customers()[0].isActive).toBe(true);
  });

  it('should add a customer', () => {
    service.loadCustomers();
    const loadReq = httpMock.expectOne('api/customers');
    loadReq.flush([]);

    service.addCustomer(mockCustomer);

    const addReq = httpMock.expectOne('api/customers');
    expect(addReq.request.method).toBe('POST');
    expect(addReq.request.body).toEqual(mockCustomer);
    addReq.flush(mockCustomer);

    expect(service.customers()).toContain(mockCustomer);
  });

  it('should handle add customer error', () => {
    service.loadCustomers();
    const loadReq = httpMock.expectOne('api/customers');
    loadReq.flush([]);

    service.addCustomer(mockCustomer);

    const addReq = httpMock.expectOne('api/customers');
    addReq.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Failed to add customer');
  });

  it('should update a customer', () => {
    service.loadCustomers();
    const loadReq = httpMock.expectOne('api/customers');
    loadReq.flush([mockCustomer]);

    const updatedCustomer: Customer = { ...mockCustomer, firstName: 'Jane' };
    service.updateCustomer(updatedCustomer);

    const updateReq = httpMock.expectOne(`api/customers/${mockCustomer.id}`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(updatedCustomer);
    updateReq.flush(updatedCustomer);

    expect(service.customers()[0].firstName).toBe('Jane');
  });

  it('should handle update customer error', () => {
    service.loadCustomers();
    const loadReq = httpMock.expectOne('api/customers');
    loadReq.flush([mockCustomer]);

    const updatedCustomer: Customer = { ...mockCustomer, firstName: 'Jane' };
    service.updateCustomer(updatedCustomer);

    const updateReq = httpMock.expectOne(`api/customers/${mockCustomer.id}`);
    updateReq.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Failed to update customer');
  });

  it('should delete customers', () => {
    const customers: Customer[] = [mockCustomer, { ...mockCustomer, id: 2, firstName: 'Jane' }];
    service.loadCustomers();
    const loadReq = httpMock.expectOne('api/customers');
    loadReq.flush(customers);

    service.deleteCustomers([mockCustomer.id]);
    const deleteReq = httpMock.expectOne('api/customers');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    expect(service.customers()).not.toContain(mockCustomer);
  });

  it('should handle delete customers error', () => {
    service.loadCustomers();
    const loadReq = httpMock.expectOne('api/customers');
    loadReq.flush([mockCustomer]);

    service.deleteCustomers([mockCustomer.id]);

    const deleteReq = httpMock.expectOne('api/customers');
    deleteReq.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Failed to delete customers');
  });
});
