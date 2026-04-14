import { PendingChangesService } from './pending-changes.service';
import { MatDialogRef } from '@angular/material/dialog';

describe('PendingChangesService', () => {
  let service: PendingChangesService;
  let mockDialogRef: Partial<MatDialogRef<unknown>>;

  beforeEach(() => {
    service = new PendingChangesService();
    mockDialogRef = {
      close: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set active dialog', () => {
    service.setActiveDialog(mockDialogRef as MatDialogRef<unknown>);
    expect(service.isPending()).toBe(false);
  });

  it('should clear active dialog', () => {
    service.setActiveDialog(mockDialogRef as MatDialogRef<unknown>);
    service.clearActiveDialog();
    expect(service.isPending()).toBe(false);
  });

  it('should set pending to true and add event listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    service.setPending(true);
    expect(service.isPending()).toBe(true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it('should set pending to false and remove event listener', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    service.setPending(true);
    service.setPending(false);
    expect(service.isPending()).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should clear pending state', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    service.setPending(true);
    service.clear();
    expect(service.isPending()).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should return true when confirmNavigation is called with no pending changes', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const result = service.confirmNavigation();
    expect(result).toBe(true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should return true when confirmNavigation is called with pending changes and user confirms', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
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
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    service.setPending(true);
    const result = service.confirmNavigation();
    expect(result).toBe(false);
    expect(service.isPending()).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Leave without saving?');
    confirmSpy.mockRestore();
  });

  it('should handle dialog close error gracefully', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
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
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
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
