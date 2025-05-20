import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SupabaseService } from '../../services/supabase.service';
import { Invitee, RSVPStatus } from '../../models/invitee.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loading = true;
  totalInvitees = 0;
  confirmedCount = 0;
  declinedCount = 0;
  pendingCount = 0;
  maybeCount = 0;

  pendingRSVPs: Invitee[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      await this.loadDashboardData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadDashboardData(): Promise<void> {
    // Get all invitees to calculate statistics
    const invitees = await this.supabaseService.getAllInvitees();

    this.totalInvitees = invitees.length;
    this.confirmedCount = invitees.filter(
      (i) => i.rsvpStatus === RSVPStatus.Confirmed
    ).length;
    this.declinedCount = invitees.filter(
      (i) => i.rsvpStatus === RSVPStatus.Declined
    ).length;
    this.pendingCount = invitees.filter(
      (i) => i.rsvpStatus === RSVPStatus.Pending
    ).length;
    this.maybeCount = invitees.filter(
      (i) => i.rsvpStatus === RSVPStatus.Maybe
    ).length;

    // Get invitees with pending RSVPs for the dashboard
    this.pendingRSVPs = await this.supabaseService.getInviteesByStatus(
      RSVPStatus.Pending
    );
  }
}
