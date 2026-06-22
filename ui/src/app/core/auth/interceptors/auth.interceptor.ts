import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Dev server nginx reverse proxy requires Basic Auth for all routes.
// These credentials are dev-only and scoped to the dev server hostname.
const DEV_BASIC_AUTH = 'Basic dGVzdGVyOn08NW9UOld6MT9EUiROUmp3fmRq';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isDevServer = this.isDevServer(req);

    if (isDevServer) {
      // Dev server: send Basic Auth for nginx reverse proxy.
      // If the user also has a JWT token, send it via X-Authorization header so the
      // API can authenticate the user after nginx passes the request.
      const token = this.authService.getToken();
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: DEV_BASIC_AUTH,
            'X-Authorization': `Bearer ${token}`,
          },
        });
      } else {
        req = req.clone({
          setHeaders: { Authorization: DEV_BASIC_AUTH },
        });
      }
    } else {
      // Non-dev (local dev, staging, production): JWT auth only
      const token = this.authService.getToken();
      if (token) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
      }
    }

    return next.handle(req);
  }

  /**
   * Check if the request is targeting the dev server.
   * Handles both absolute URLs (in browser) and relative URLs (in tests).
   */
  private isDevServer(req: HttpRequest<unknown>): boolean {
    // Try urlWithObject first (available when base href is set or absolute URL)
    try {
      if (req.urlWithObject) {
        return req.urlWithObject.hostname.endsWith('statikk.mooo.com');
      }
    } catch {
      // urlWithObject may throw if URL parsing fails
    }

    // Fallback: check the raw URL string
    return req.url.includes('statikk.mooo.com');
  }
}
