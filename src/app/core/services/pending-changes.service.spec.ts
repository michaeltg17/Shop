import { PendingChangesService } from './pending-changes.service';
import { MatDialogRef } from '@angular/material/dialog';

describe('PendingChangesService', () => {
  let service: PendingChangesService;
  let mockDialogRef: Partial<MatDialogRef<unknown>>;

  beforeEach(() => {
    service = new PendingChangesService();
    mockDialogRef = {
      close: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set active dialog', () => {
    service.setActiveDialog(mockDialogRef as MatDialogRef<unknown>);
    expect(service.isPending()).toBe(false);
    // Verify the dialog ref was actually stored by calling confirmNavigation which uses it
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should clear active dialog', () => {
    service.setActiveDialog(mockDialogRef as MatDialogRef<unknown>);
    service.clearActiveDialog();
    expect(service.isPending()).toBe(false);
    // After clearing, confirmNavigation should NOT call close on the old ref
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should call dialog.close() in confirmNavigation when pending and user confirms', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    service.setPending(true);
    service.setActiveDialog(mockDialogRef as MatDialogRef<unknown>);
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(mockDialogRef.close).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('should trigger beforeunload handler when pending', () => {
    service.setPending(true);
    const event = {
      preventDefault: jest.fn(),
      returnValue: undefined,
    } as unknown as BeforeUnloadEvent;
    // Access the private handler via the service's internal behavior
    // We can verify it was registered by checking the event
    const handler = (
      service as unknown as { _beforeUnloadHandler: (e: BeforeUnloadEvent) => string }
    )._beforeUnloadHandler;
    const ret = handler(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe('');
    expect(ret).toBe('');
  });

  it('should set pending to true and add event listener', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    service.setPending(true);
    expect(service.isPending()).toBe(true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it('should set pending to false and remove event listener', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    service.setPending(true);
    service.setPending(false);
    expect(service.isPending()).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should clear pending state', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    service.setPending(true);
    service.clear();
    expect(service.isPending()).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should return true when confirmNavigation is called with no pending changes', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should return true when confirmNavigation is called with pending changes and user confirms', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    service.setPending(true);
    service.setActiveDialog(mockDialogRef as MatDialogRef<unknown>);
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(service.isPending()).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Leave without saving?');
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    confirmSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should return false when confirmNavigation is called with pending changes and user cancels', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    service.setPending(true);
    const result = service.confirmNavigation();
    expect(result).toBe(false);
    expect(service.isPending()).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Leave without saving?');
    confirmSpy.mockRestore();
  });

  it('should handle dialog close error gracefully', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const errorDialogRef: Partial<MatDialogRef<unknown>> = {
      close: () => {
        throw new Error('Dialog already closed');
      },
    };
    service.setActiveDialog(errorDialogRef as MatDialogRef<unknown>);
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should handle dialog close error gracefully when pending', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const errorDialogRef: Partial<MatDialogRef<unknown>> = {
      close: () => {
        throw new Error('Dialog already closed');
      },
    };
    service.setPending(true);
    service.setActiveDialog(errorDialogRef as MatDialogRef<unknown>);
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Leave without saving?');
    confirmSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
