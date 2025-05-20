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

import { SupabaseService } from '../../services/supabase.service';
import { Invitee, RelationType, RSVPStatus } from '../../models/invitee.model';

@Component({
  selector: 'app-invitee-form',
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
  ],
  templateUrl: './invitee-form.component.html',
  styleUrls: ['./invitee-form.component.scss'],
})
export class InviteeFormComponent implements OnInit {
  inviteeForm!: FormGroup;
  isEditMode = false;
  loading = true;
  submitting = false;
  inviteeId: string | null = null;

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
        this.inviteeId = id;
        await this.loadInvitee(id);
      }
      this.loading = false;
    });
  }

  initializeForm(): void {
    this.inviteeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+[0-9]{10,15}$/)],
      ],
      email: ['', Validators.email],
      numberOfGuests: [
        1,
        [Validators.required, Validators.min(1), Validators.max(10)],
      ],
      relation: ['friend', Validators.required],
      rsvpStatus: ['pending'],
      dietaryRestrictions: [''],
      specialRequests: [''],
      additionalInfo: [''],
    });
  }

  async loadInvitee(id: string): Promise<void> {
    try {
      const invitee = await this.supabaseService.getInviteeById(id);
      if (invitee) {
        this.inviteeForm.patchValue({
          firstName: invitee.firstName,
          lastName: invitee.lastName,
          phoneNumber: invitee.phoneNumber,
          email: invitee.email || '',
          numberOfGuests: invitee.numberOfGuests,
          relation: invitee.relation,
          rsvpStatus: invitee.rsvpStatus,
          dietaryRestrictions: invitee.dietaryRestrictions || '',
          specialRequests: invitee.specialRequests || '',
          additionalInfo: invitee.additionalInfo || '',
        });
      } else {
        this.showNotification('Invitee not found', 'error');
        this.router.navigate(['/invitees']);
      }
    } catch (error) {
      console.error('Error loading invitee:', error);
      this.showNotification('Failed to load invitee details', 'error');
      this.router.navigate(['/invitees']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.inviteeForm.invalid) {
      return;
    }

    this.submitting = true;

    try {
      const inviteeData: Invitee = {
        firstName: this.inviteeForm.value.firstName,
        lastName: this.inviteeForm.value.lastName,
        phoneNumber: this.inviteeForm.value.phoneNumber,
        email: this.inviteeForm.value.email || undefined,
        numberOfGuests: this.inviteeForm.value.numberOfGuests,
        relation: this.inviteeForm.value.relation as RelationType,
        rsvpStatus: this.inviteeForm.value.rsvpStatus as RSVPStatus,
        dietaryRestrictions:
          this.inviteeForm.value.dietaryRestrictions || undefined,
        specialRequests: this.inviteeForm.value.specialRequests || undefined,
        additionalInfo: this.inviteeForm.value.additionalInfo || undefined,
      };

      if (this.isEditMode && this.inviteeId) {
        await this.supabaseService.updateInvitee(this.inviteeId, inviteeData);
        this.showNotification('Invitee updated successfully', 'success');
      } else {
        await this.supabaseService.createInvitee(inviteeData);
        this.showNotification('Invitee added successfully', 'success');
      }

      this.router.navigate(['/invitees']);
    } catch (error) {
      console.error('Error saving invitee:', error);
      this.showNotification(
        `Failed to ${
          this.isEditMode ? 'update' : 'add'
        } invitee. Please try again.`,
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

  submitForm(): void {
    this.onSubmit();
  }
}
