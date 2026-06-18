import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ThemeSelector } from '../../components/theme-selector/theme-selector';
import { TitleService } from '../../../core/services/title.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [MatToolbarModule, MatButtonModule, ThemeSelector, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  protected titleService = inject(TitleService);
}
