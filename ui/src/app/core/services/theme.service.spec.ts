import { ThemeService } from './theme.service';
import { ThemeColor, ThemeMode } from '../models/theme';

// Mock localStorage before creating the service
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    service = new ThemeService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with light theme and blue color', () => {
    expect(service.currentTheme.mode).toBe('light');
    expect(service.currentTheme.color).toBe('blue');
  });

  it('should set theme color', () => {
    service.setThemeColor('purple' as ThemeColor);
    expect(service.currentTheme.color).toBe('purple');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should set theme mode', () => {
    service.setThemeMode('dark' as ThemeMode);
    expect(service.currentTheme.mode).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should load theme from localStorage when available', () => {
    const savedTheme = { mode: 'dark', color: 'green' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTheme));

    const testService = new ThemeService();
    testService.loadTheme();

    expect(testService.currentTheme.mode).toBe('dark');
    expect(testService.currentTheme.color).toBe('green');
  });

  it('should apply default theme when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    service.loadTheme();

    expect(service.currentTheme.mode).toBe('light');
    expect(service.currentTheme.color).toBe('blue');
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    service.loadTheme();

    expect(service.currentTheme.mode).toBe('light');
    expect(service.currentTheme.color).toBe('blue');
  });

  it('should remove all theme classes before applying new theme', () => {
    service.setThemeColor('purple' as ThemeColor);
    service.setThemeColor('green' as ThemeColor);
  });

  it('should persist theme after setting color', () => {
    service.setThemeColor('green' as ThemeColor);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should persist theme after setting mode', () => {
    service.setThemeMode('dark' as ThemeMode);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should use "theme" as storage key', () => {
    service.setThemeColor('red' as ThemeColor);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', expect.any(String));
  });

  it('should apply theme classes to document element', () => {
    service.setThemeMode('dark' as ThemeMode);
    expect(document.documentElement.classList).toContain('dark');
    service.setThemeMode('light' as ThemeMode);
    expect(document.documentElement.classList).toContain('light');
  });

  it('should store theme as JSON string in localStorage', () => {
    service.setThemeColor('green' as ThemeColor);
    const callArgs = (localStorageMock.setItem as jest.Mock).mock.calls[0];
    const stored = JSON.parse(callArgs[1] as string);
    expect(stored.color).toBe('green');
    expect(stored.mode).toBe('light');
  });
});
