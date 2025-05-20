import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { SupabaseService } from '../../services/supabase.service';
import { MessageTemplate } from '../../models/message-template.model';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent implements OnInit {
  templates: MessageTemplate[] = [];
  loading = true;

  // Add method to get count by type
  getCountByType(type: string): number {
    return this.templates.filter((t) => t.type === type).length;
  }

  // Add duplicate template method
  duplicateTemplate(template: MessageTemplate): void {
    const duplicated: MessageTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
    };
    delete (duplicated as any).id;

    this.supabaseService
      .createMessageTemplate(duplicated)
      .then(() => {
        this.showNotification('Template duplicated successfully', 'success');
        this.loadTemplates();
      })
      .catch((error) => {
        console.error('Error duplicating template:', error);
        this.showNotification('Failed to duplicate template', 'error');
      });
  }

  constructor(
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      await this.loadTemplates();
    } catch (error) {
      console.error('Error loading templates:', error);
      this.showNotification('Failed to load message templates', 'error');
    } finally {
      this.loading = false;
    }
  }

  async loadTemplates(): Promise<void> {
    this.templates = await this.supabaseService.getAllMessageTemplates();
  }

  async confirmDelete(template: MessageTemplate): Promise<void> {
    if (
      confirm(
        `Are you sure you want to delete the "${template.name}" template?`
      )
    ) {
      try {
        await this.supabaseService.deleteMessageTemplate(template.id!);
        this.templates = this.templates.filter((t) => t.id !== template.id);
        this.showNotification('Template deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting template:', error);
        this.showNotification('Failed to delete template', 'error');
      }
    }
  }

  selectTemplateForSending(template: MessageTemplate): void {
    // This would open a dialog to select recipients and send the template
    // For now, just show a notification
    this.showNotification(
      'Send message feature will be implemented soon',
      'info'
    );
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
