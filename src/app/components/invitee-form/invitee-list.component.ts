import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { SupabaseService } from '../../services/supabase.service';
import { ExportService } from '../../services/export.service';
import { Invitee, RSVPStatus, RelationType } from '../../models/invitee.model';

@Component({
  selector: 'app-invitee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './invitee-list.component.html',
  styleUrls: ['./invitee-list.component.scss'],
})
export class InviteeListComponent implements OnInit {
  invitees: Invitee[] = [];
  filteredInvitees: Invitee[] = [];
  paginatedInvitees: Invitee[] = [];
  loading = true;

  // Computed properties for status counts
  get confirmedCount(): number {
    return this.invitees.filter((i) => i.rsvp_status === 'confirmed').length;
  }

  get pendingCount(): number {
    return this.invitees.filter((i) => i.rsvp_status === 'pending').length;
  }

  get maybeCount(): number {
    return this.invitees.filter((i) => i.rsvp_status === 'maybe').length;
  }

  get declinedCount(): number {
    return this.invitees.filter((i) => i.rsvp_status === 'declined').length;
  }

  // Table configuration
  displayedColumns: string[] = [
    'name',
    'phone',
    'guests',
    'relation',
    'rsvpStatus',
    'actions',
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Filters
  searchText = '';
  statusFilter = 'all';
  relationFilter = 'all';

  constructor(
    private supabaseService: SupabaseService,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      await this.loadInvitees();
    } catch (error) {
      console.error('Error loading invitees:', error);
      this.showNotification(
        'Failed to load invitees. Please try again.',
        'error'
      );
    } finally {
      this.loading = false;
    }
  }

  async loadInvitees(): Promise<void> {
    this.invitees = await this.supabaseService.getAllInvitees();
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.invitees];

    // Apply search text filter
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (invitee) =>
          `${invitee.first_name} ${invitee.last_name}`
            .toLowerCase()
            .includes(search) || invitee.phone_number.includes(search)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(
        (invitee) => invitee.rsvp_status === this.statusFilter
      );
    }

    // Apply relation filter
    if (this.relationFilter !== 'all') {
      filtered = filtered.filter(
        (invitee) => invitee.relation === this.relationFilter
      );
    }

    this.filteredInvitees = filtered;
    this.pageIndex = 0; // Reset to first page when filtering
    this.updatePaginatedInvitees();
  }

  updatePaginatedInvitees(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedInvitees = this.filteredInvitees.slice(start, end);
  }

  handlePageEvent(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedInvitees();
  }

  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredInvitees = this.filteredInvitees.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return this.compare(
            `${a.first_name} ${a.last_name}`,
            `${b.first_name} ${b.last_name}`,
            isAsc
          );
        case 'guests':
          return this.compare(a.number_of_guests, b.number_of_guests, isAsc);
        default:
          return 0;
      }
    });

    this.updatePaginatedInvitees();
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  async confirmDelete(invitee: Invitee): Promise<void> {
    if (
      confirm(
        `Are you sure you want to delete ${invitee.first_name} ${invitee.last_name}?`
      )
    ) {
      try {
        await this.supabaseService.deleteInvitee(invitee.id!);
        this.invitees = this.invitees.filter((i) => i.id !== invitee.id);
        this.applyFilter();
        this.showNotification('Invitee deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting invitee:', error);
        this.showNotification('Failed to delete invitee', 'error');
      }
    }
  }

  async sendReminder(invitee: Invitee): Promise<void> {
    try {
      // This would be implemented to send a reminder message
      // through the message service, but we'll mock it for now
      this.showNotification(
        `RSVP reminder sent to ${invitee.first_name}`,
        'success'
      );
    } catch (error) {
      console.error('Error sending reminder:', error);
      this.showNotification('Failed to send reminder', 'error');
    }
  }

  exportInviteeList(): void {
    try {
      this.exportService.exportToExcel(this.invitees);
      this.showNotification(
        'Export started. Your file will download shortly.',
        'success'
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.showNotification('Failed to export data', 'error');
    }
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass:
        type === 'error'
          ? ['error-snackbar']
          : type === 'success'
          ? ['success-snackbar']
          : ['info-snackbar'],
    });
  }
}
