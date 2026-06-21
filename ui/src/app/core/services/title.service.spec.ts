import { TitleService } from './title.service';

describe('TitleService', () => {
  let service: TitleService;

  beforeEach(() => {
    service = new TitleService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return title function', () => {
    expect(service.getTitle).toBeDefined();
    expect(typeof service.getTitle).toBe('function');
  });

  it('should return "Angular App" as title', () => {
    expect(service.getTitle()).toBe('Angular App');
  });
});
