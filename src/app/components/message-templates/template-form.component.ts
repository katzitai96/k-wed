import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { SupabaseService } from '../../services/supabase.service';
import { MessageTemplate } from '../../models/message-template.model';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
})
export class TemplateFormComponent implements OnInit {
  templateForm!: FormGroup;
  isEditMode = false;
  loading = true;
  submitting = false;
  templateId: string | null = null;

  // Sample variables for message template
  firstName = 'John';
  lastName = 'Smith';
  numberOfGuests = 2;
  phoneNumber = '+1234567890';
  email = 'john@example.com';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.templateId = id;
        await this.loadTemplate(id);
      }
      this.loading = false;
    });
  }

  initializeForm(): void {
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      type: ['invitation'],
      subject: ['', Validators.required],
      body: ['', Validators.required],
    });
  }

  insertVariable(varName: string): void {
    const bodyControl = this.templateForm.get('body');
    const currentContent = bodyControl?.value || '';
    const insertion = `{{ ${varName} }}`;
    bodyControl?.setValue(currentContent + insertion);
    bodyControl?.markAsDirty();
  }

  async loadTemplate(id: string): Promise<void> {
    try {
      const template = await this.supabaseService.getMessageTemplateById(id);
      if (template) {
        this.templateForm.patchValue({
          name: template.name,
          type: template.type,
          subject: template.subject,
          body: template.body,
        });
      } else {
        this.showNotification('Template not found', 'error');
        this.router.navigate(['/messages']);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      this.showNotification('Failed to load template details', 'error');
      this.router.navigate(['/messages']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.templateForm.invalid) {
      return;
    }

    this.submitting = true;

    try {
      const templateData: MessageTemplate = {
        name: this.templateForm.value.name,
        type: this.templateForm.value.type,
        subject: this.templateForm.value.subject,
        body: this.templateForm.value.body,
      };

      if (this.isEditMode && this.templateId) {
        await this.supabaseService.updateMessageTemplate(
          this.templateId,
          templateData
        );
        this.showNotification('Template updated successfully', 'success');
      } else {
        await this.supabaseService.createMessageTemplate(templateData);
        this.showNotification('Template created successfully', 'success');
      }

      this.router.navigate(['/messages']);
    } catch (error) {
      console.error('Error saving template:', error);
      this.showNotification(
        `Failed to ${
          this.isEditMode ? 'update' : 'create'
        } template. Please try again.`,
        'error'
      );
    } finally {
      this.submitting = false;
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
