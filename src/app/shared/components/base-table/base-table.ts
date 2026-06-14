import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface ColumnDef {
  key: string;
  label: string;
}

/**
 * Shared base table component with:
 * - search / filter input
 * - add / edit / delete action buttons (icon buttons)
 * - multi-row selection via checkboxes
 * - sort-able columns
 * - pagination
 * - dynamic column definitions
 *
 * Cell rendering is delegated to a consumer-supplied TemplateRef via the
 * `cellTemplate` input, receiving `{ $implicit: row, column: ColumnDef }` context.
 * If no cellTemplate is supplied, falls back to plain `{{ row[col.key] }}`.
 */
@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,
  ],
  template: `
    <div class="toolbar">
      <mat-form-field appearance="outline">
        <mat-label>Search</mat-label>
        <input
          matInput
          [value]="filterValue"
          (input)="onFilterChange($event)"
          placeholder="Filter rows"
        />
      </mat-form-field>

      <button
        mat-icon-button
        (click)="add.emit()"
        [attr.aria-label]="addButtonLabel"
        [disabled]="addButtonDisabled"
      >
        <mat-icon>{{ addIcon ?? 'add' }}</mat-icon>
      </button>

      <button
        mat-icon-button
        (click)="onEdit()"
        [attr.aria-label]="editButtonLabel"
        [disabled]="editButtonDisabled || selection.selected.length !== 1"
      >
        <mat-icon>{{ editIcon ?? 'edit' }}</mat-icon>
      </button>

      <button
        mat-icon-button
        (click)="onDelete()"
        [attr.aria-label]="deleteButtonLabel"
        [disabled]="deleteButtonDisabled || selection.selected.length === 0"
      >
        <mat-icon>{{ deleteIcon ?? 'delete' }}</mat-icon>
      </button>
    </div>

    <div class="table-wrap">
      <table mat-table [dataSource]="dataSource" matSort class="table">
        <!-- Select Column -->
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox
              [checked]="isAllSelected()"
              [indeterminate]="selection.hasValue() && !isAllSelected()"
              (change)="toggleAllRows()"
            ></mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox
              (click)="$event.stopPropagation()"
              (change)="selection.toggle(row)"
              [checked]="selection.isSelected(row)"
            ></mat-checkbox>
          </td>
        </ng-container>

        <!-- Dynamic Columns -->
        @for (col of columns(); track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              @if (cellTemplate) {
                <ng-container
                  [ngTemplateOutlet]="cellTemplate"
                  [ngTemplateOutletContext]="{ $implicit: row, column: col }"
                ></ng-container>
              } @else {
                {{ row[col.key] }}
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns()"
          (click)="rowClick.emit(row)"
        ></tr>
      </table>

      <mat-paginator [pageSizeOptions]="pageSizeOptions()" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }

      .toolbar mat-form-field {
        flex: 1;
        min-width: 200px;
      }

      .table-wrap {
        overflow-x: auto;
      }

      .table {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseTableComponent<T> implements AfterViewInit {
  // --- inputs ---
  @Input() columns: () => ColumnDef[] = () => [];
  @Input() dataSource = new MatTableDataSource<T>();
  @Input() selection = new SelectionModel<T>(true, []);
  @Input() pageSizeOptions: () => number[] = () => [5, 10, 25, 50];
  @Input() filterValue = '';
  @Input() addIcon: string | null = null;
  @Input() editIcon: string | null = null;
  @Input() deleteIcon: string | null = null;
  @Input() addButtonLabel = 'Add';
  @Input() editButtonLabel = 'Edit';
  @Input() deleteButtonLabel = 'Delete';
  @Input() addButtonDisabled = false;
  @Input() editButtonDisabled = false;
  @Input() deleteButtonDisabled = false;
  @Input() cellTemplate: TemplateRef<unknown> | null = null;

  // --- outputs ---
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<T>();

  // --- view children ---
  @ViewChild(MatTable) table!: MatTable<T>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = (): string[] => ['select', ...this.columns().map(c => c.key)];

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.filterValue = value.trim().toLowerCase();
    this.dataSource.filter = this.filterValue;
    this.filterChange.emit(this.filterValue);
  }

  onEdit(): void {
    if (this.selection.selected.length !== 1) return;
    this.edit.emit();
  }

  onDelete(): void {
    if (this.selection.selected.length === 0) return;
    this.delete.emit();
  }
}
