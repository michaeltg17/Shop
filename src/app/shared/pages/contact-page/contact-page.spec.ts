import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactPage } from './contact-page';

describe('ContactPage', () => {
  let component: ContactPage;
  let fixture: ComponentFixture<ContactPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize contactForm with invalid state', () => {
    expect(component.contactForm.invalid).toBe(true);
  });

  it('should have required and minLength validators for name', () => {
    const nameCtrl = component.contactForm.get('name');
    // required validator
    nameCtrl?.setValue('');
    expect(nameCtrl?.errors?.['required']).toBe(true);
    // minLength validator
    nameCtrl?.setValue('a');
    expect(nameCtrl?.errors?.['minlength']).toBeTruthy();
    nameCtrl?.setValue('John');
    expect(nameCtrl?.valid).toBe(true);
  });

  it('should have required and email validators for email', () => {
    const emailCtrl = component.contactForm.get('email');
    // required validator
    emailCtrl?.setValue('');
    expect(emailCtrl?.errors?.['required']).toBe(true);
    // email validator
    emailCtrl?.setValue('not-an-email');
    expect(emailCtrl?.errors?.['email']).toBeTruthy();
    emailCtrl?.setValue('test@example.com');
    expect(emailCtrl?.valid).toBe(true);
  });

  it('should have required and minLength validators for subject', () => {
    const subjectCtrl = component.contactForm.get('subject');
    // required validator
    subjectCtrl?.setValue('');
    expect(subjectCtrl?.errors?.['required']).toBe(true);
    // minLength validator
    subjectCtrl?.setValue('abc');
    expect(subjectCtrl?.errors?.['minlength']).toBeTruthy();
    subjectCtrl?.setValue('Hello');
    expect(subjectCtrl?.valid).toBe(true);
  });

  it('should have required and minLength validators for message', () => {
    const msgCtrl = component.contactForm.get('message');
    // required validator
    msgCtrl?.setValue('');
    expect(msgCtrl?.errors?.['required']).toBe(true);
    // minLength validator
    msgCtrl?.setValue('short');
    expect(msgCtrl?.errors?.['minlength']).toBeTruthy();
    msgCtrl?.setValue('abcdefghij');
    expect(msgCtrl?.valid).toBe(true);
  });

  it('should provide accessors for form controls', () => {
    expect(component.name).toBe(component.contactForm.get('name'));
    expect(component.email).toBe(component.contactForm.get('email'));
    expect(component.subject).toBe(component.contactForm.get('subject'));
    expect(component.message).toBe(component.contactForm.get('message'));
  });

  it('should reset form on submit', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation((_message?: string) => {
      void _message;
    });
    component.contactForm.get('name')?.setValue('John');
    component.contactForm.get('email')?.setValue('john@example.com');
    component.contactForm.get('subject')?.setValue('Hello');
    component.contactForm.get('message')?.setValue('Test message here');
    component.onSubmit();
    expect(alertSpy).toHaveBeenCalledWith(
      'Thank you for your message! We will get back to you soon.'
    );
    expect(component.contactForm.pristine).toBe(true);
  });
});
