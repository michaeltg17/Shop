import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ThemeSelector } from '../../components/theme-selector/theme-selector';
import { TitleService } from '../../../core/services/title.service';
import { RouterModule } from '@angular/router';
import { CartIcon } from '../../components/cart-icon/cart-icon';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-ecommerce-layout',
  imports: [CommonModule, MatToolbarModule, MatButtonModule, ThemeSelector, RouterModule, CartIcon],
  templateUrl: './ecommerce-layout.html',
  styleUrl: './ecommerce-layout.css',
})
export class EcommerceLayout {
  protected titleService = inject(TitleService);
  protected authService = inject(AuthService);
}
