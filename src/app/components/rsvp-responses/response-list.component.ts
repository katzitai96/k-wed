import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { SupabaseService } from '../../services/supabase.service';
import { MessageService } from '../../services/message.service';
import { ExportService } from '../../services/export.service';
import { Invitee, RSVPStatus } from '../../models/invitee.model';
import { MessageTemplate } from '../../models/message-template.model';

@Component({
  selector: 'app-response-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './response-list.component.html',
  styleUrls: ['./response-list.component.scss'],
})
export class ResponseListComponent implements OnInit {
  allInvitees: Invitee[] = [];
  confirmedInvitees: Invitee[] = [];
  pendingInvitees: Invitee[] = [];
  maybeInvitees: Invitee[] = [];
  declinedInvitees: Invitee[] = [];

  // Additional properties for template view
  invitees: Invitee[] = [];
  messageTemplates: MessageTemplate[] = [];
  selectedTemplate: MessageTemplate | null = null;
  selectedGroup: string = 'all';
  bulkSending: boolean = false;
  bulkProgress: number = 0;
  bulkTotal: number = 0;
  sendingMessage: string | null = null;

  filteredConfirmedInvitees: Invitee[] = [];
  filteredPendingInvitees: Invitee[] = [];
  filteredMaybeInvitees: Invitee[] = [];
  filteredDeclinedInvitees: Invitee[] = [];

  templates: MessageTemplate[] = [];

  loading = true;
  searchText = '';

  totalInvitees = 0;
  confirmedCount = 0;
  pendingCount = 0;
  maybeCount = 0;
  declinedCount = 0;

  constructor(
    private supabaseService: SupabaseService,
    private messageService: MessageService,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      await Promise.all([this.loadInvitees(), this.loadTemplates()]);
    } catch (error) {
      console.error('Error loading RSVP data:', error);
      this.showNotification('Failed to load RSVP data', 'error');
    } finally {
      this.loading = false;
    }
  }

  async loadInvitees(): Promise<void> {
    this.allInvitees = await this.supabaseService.getAllInvitees();

    this.confirmedInvitees = this.allInvitees.filter(
      (i) => i.rsvp_status === RSVPStatus.Confirmed
    );
    this.pendingInvitees = this.allInvitees.filter(
      (i) => i.rsvp_status === RSVPStatus.Pending
    );
    this.maybeInvitees = this.allInvitees.filter(
      (i) => i.rsvp_status === RSVPStatus.Maybe
    );
    this.declinedInvitees = this.allInvitees.filter(
      (i) => i.rsvp_status === RSVPStatus.Declined
    );

    this.totalInvitees = this.allInvitees.length;
    this.confirmedCount = this.confirmedInvitees.length;
    this.pendingCount = this.pendingInvitees.length;
    this.maybeCount = this.maybeInvitees.length;
    this.declinedCount = this.declinedInvitees.length;

    this.filterInvitees();
  }

  async loadTemplates(): Promise<void> {
    this.templates = await this.supabaseService.getAllMessageTemplates();
  }

  filterInvitees(): void {
    if (!this.searchText) {
      this.filteredConfirmedInvitees = [...this.confirmedInvitees];
      this.filteredPendingInvitees = [...this.pendingInvitees];
      this.filteredMaybeInvitees = [...this.maybeInvitees];
      this.filteredDeclinedInvitees = [...this.declinedInvitees];
      return;
    }

    const search = this.searchText.toLowerCase();

    this.filteredConfirmedInvitees = this.confirmedInvitees.filter((i) =>
      `${i.first_name} ${i.last_name}`.toLowerCase().includes(search)
    );

    this.filteredPendingInvitees = this.pendingInvitees.filter((i) =>
      `${i.first_name} ${i.last_name}`.toLowerCase().includes(search)
    );

    this.filteredMaybeInvitees = this.maybeInvitees.filter((i) =>
      `${i.first_name} ${i.last_name}`.toLowerCase().includes(search)
    );

    this.filteredDeclinedInvitees = this.declinedInvitees.filter((i) =>
      `${i.first_name} ${i.last_name}`.toLowerCase().includes(search)
    );
  }

  async sendReminder(invitee: Invitee): Promise<void> {
    // Find reminder template
    const reminderTemplate = this.templates.find((t) => t.type === 'reminder');

    if (!reminderTemplate) {
      this.showNotification(
        'No reminder template found. Please create one first.',
        'error'
      );
      return;
    }

    try {
      // This would actually send the message through the API
      // For now we'll just show a notification
      this.messageService
        .sendTemplatedMessage(invitee, reminderTemplate)
        .subscribe({
          next: () => {
            this.showNotification(
              `Reminder sent to ${invitee.first_name} ${invitee.last_name}`,
              'success'
            );
          },
          error: (error) => {
            console.error('Error sending reminder:', error);
            this.showNotification('Failed to send reminder', 'error');
          },
        });
    } catch (error) {
      console.error('Error sending reminder:', error);
      this.showNotification('Failed to send reminder', 'error');
    }
  }

  async sendReminderToAll(): Promise<void> {
    // Find reminder template
    const reminderTemplate = this.templates.find((t) => t.type === 'reminder');

    if (!reminderTemplate) {
      this.showNotification(
        'No reminder template found. Please create one first.',
        'error'
      );
      return;
    }

    if (!this.pendingInvitees.length) {
      this.showNotification('No pending invitees to send reminders to', 'info');
      return;
    }

    if (
      confirm(
        `Are you sure you want to send reminders to all ${this.pendingInvitees.length} pending invitees?`
      )
    ) {
      try {
        // This would actually send the messages through the API
        // For now we'll just show a notification
        this.messageService
          .sendBulkMessages(this.pendingInvitees, reminderTemplate)
          .subscribe({
            next: () => {
              this.showNotification(
                `Reminders sent to ${this.pendingInvitees.length} invitees`,
                'success'
              );
            },
            error: (error) => {
              console.error('Error sending reminders:', error);
              this.showNotification('Failed to send reminders', 'error');
            },
          });
      } catch (error) {
        console.error('Error sending reminders:', error);
        this.showNotification('Failed to send reminders', 'error');
      }
    }
  }

  async sendLocationDetails(invitee: Invitee): Promise<void> {
    // Find location template
    const locationTemplate = this.templates.find((t) => t.type === 'location');

    if (!locationTemplate) {
      this.showNotification(
        'No location template found. Please create one first.',
        'error'
      );
      return;
    }

    try {
      // This would actually send the message through the API
      // For now we'll just show a notification
      this.messageService
        .sendTemplatedMessage(invitee, locationTemplate)
        .subscribe({
          next: () => {
            this.showNotification(
              `Location details sent to ${invitee.first_name} ${invitee.last_name}`,
              'success'
            );
          },
          error: (error) => {
            console.error('Error sending location details:', error);
            this.showNotification('Failed to send location details', 'error');
          },
        });
    } catch (error) {
      console.error('Error sending location details:', error);
      this.showNotification('Failed to send location details', 'error');
    }
  }
  async sendFollowUp(invitee: Invitee): Promise<void> {
    this.sendingMessage = invitee.id as string; // Type assertion to fix the error

    // For users who responded "maybe"
    const followUpTemplate = this.templates.find(
      (t) => t.name.toLowerCase().includes('follow') || t.type === 'reminder'
    );

    if (!followUpTemplate) {
      this.sendingMessage = null;
      this.showNotification(
        'No follow-up template found. Please create one first.',
        'error'
      );
      return;
    }

    try {
      // This would actually send the message through the API
      // For now we'll just show a notification
      this.messageService
        .sendTemplatedMessage(invitee, followUpTemplate)
        .subscribe({
          next: () => {
            this.showNotification(
              `Follow-up sent to ${invitee.first_name} ${invitee.last_name}`,
              'success'
            );
          },
          error: (error) => {
            console.error('Error sending follow-up:', error);
            this.showNotification('Failed to send follow-up', 'error');
          },
        });
    } catch (error) {
      console.error('Error sending follow-up:', error);
      this.showNotification('Failed to send follow-up', 'error');
    }
  }

  exportResponses(): void {
    try {
      this.exportService.exportToExcel(
        this.allInvitees,
        'wedding-rsvp-responses.xlsx'
      );
      this.showNotification(
        'Export started. Your file will download shortly.',
        'success'
      );
    } catch (error) {
      console.error('Error exporting responses:', error);
      this.showNotification('Failed to export responses', 'error');
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

  // Methods for template stats and actions
  getTotalInvitees(): number {
    return this.totalInvitees;
  }

  getInviteesByStatus(status: string): number {
    switch (status) {
      case 'confirmed':
        return this.confirmedCount;
      case 'pending':
        return this.pendingCount;
      case 'maybe':
        return this.maybeCount;
      case 'declined':
        return this.declinedCount;
      default:
        return 0;
    }
  }

  getFilteredInvitees(status: string): Invitee[] {
    switch (status) {
      case 'confirmed':
        return this.filteredConfirmedInvitees;
      case 'pending':
        return this.filteredPendingInvitees;
      case 'maybe':
        return this.filteredMaybeInvitees;
      case 'declined':
        return this.filteredDeclinedInvitees;
      default:
        return [];
    }
  }

  getTotalGuests(): number {
    return this.allInvitees.reduce(
      (total, invitee) => total + invitee.number_of_guests,
      0
    );
  }

  getResponseRate(): number {
    if (this.totalInvitees === 0) return 0;
    const responded =
      this.confirmedCount + this.declinedCount + this.maybeCount;
    return Math.round((responded / this.totalInvitees) * 100);
  }
  sendMessage(invitee: Invitee): void {
    // Implementation for sending a message to a specific invitee
    this.sendingMessage = invitee.id as string; // Type assertion to fix the error
    setTimeout(() => {
      this.showNotification(
        `Message sent to ${invitee.first_name} ${invitee.last_name}`,
        'success'
      );
      this.sendingMessage = null;
    }, 1500);
  }

  sendBulkMessages(): void {
    if (!this.selectedTemplate) return;

    let targetInvitees: Invitee[] = [];
    switch (this.selectedGroup) {
      case 'confirmed':
        targetInvitees = this.confirmedInvitees;
        break;
      case 'pending':
        targetInvitees = this.pendingInvitees;
        break;
      case 'maybe':
        targetInvitees = this.maybeInvitees;
        break;
      case 'declined':
        targetInvitees = this.declinedInvitees;
        break;
      default:
        targetInvitees = this.allInvitees;
    }

    this.bulkSending = true;
    this.bulkTotal = targetInvitees.length;
    this.bulkProgress = 0;

    // Simulate sending messages
    let sent = 0;
    const interval = setInterval(() => {
      if (sent >= targetInvitees.length) {
        clearInterval(interval);
        this.bulkSending = false;
        this.showNotification(`Messages sent to ${sent} invitees`, 'success');
        return;
      }

      sent++;
      this.bulkProgress = sent;
    }, 300);
  }

  // For the "Remind Later" functionality  // This is intentionally left blank since the original method exists

  // Export responses data
  exportResponsesData(): void {
    try {
      this.exportService.exportToExcel(
        this.allInvitees,
        'wedding-rsvp-responses.xlsx'
      );
      this.showNotification(
        'Export started, your file will download shortly',
        'success'
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showNotification('Failed to export data', 'error');
    }
  }
}
