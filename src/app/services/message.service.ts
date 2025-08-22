import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invitee } from '../models/invitee.model';
import { MessageTemplate } from '../models/message-template.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  // private apiUrl = '/api'; // Default API URL, can be overridden by environment config
  private apiUrl = process.env['API_URL']; // Use API URL from environment

  constructor(private http: HttpClient) {}

  /**
   * Send a WhatsApp message to an individual invitee
   */
  sendWhatsAppMessage(invitee: Invitee, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-message`, {
      to: `whatsapp:${invitee.phone_number}`,
      body: message,
    });
  }

  /**
   * Send a templated message to an individual invitee
   */
  sendTemplatedMessage(
    invitee: Invitee,
    template: MessageTemplate
  ): Observable<any> {
    // Replace placeholders with actual values
    let messageBody = template.body
      .replace('{{firstName}}', invitee.first_name)
      .replace('{{lastName}}', invitee.last_name)
      .replace('{{fullName}}', `${invitee.first_name} ${invitee.last_name}`);

    return this.sendWhatsAppMessage(invitee, messageBody);
  }

  /**
   * Send bulk messages to multiple invitees
   */
  sendBulkMessages(
    invitees: Invitee[],
    template: MessageTemplate
  ): Observable<any> {
    const requests = invitees.map((invitee) => {
      const messageBody = template.body
        .replace('{{firstName}}', invitee.first_name)
        .replace('{{lastName}}', invitee.last_name)
        .replace('{{fullName}}', `${invitee.first_name} ${invitee.last_name}`);

      return {
        to: `whatsapp:${invitee.phone_number}`,
        body: messageBody,
      };
    });

    return this.http.post(`${this.apiUrl}/send-bulk-messages`, {
      messages: requests,
    });
  }

  /**
   * Send RSVP reminders to invitees who haven't responded
   */
  sendRSVPReminders(
    invitees: Invitee[],
    reminderTemplate: MessageTemplate
  ): Observable<any> {
    return this.sendBulkMessages(invitees, reminderTemplate);
  }

  /**
   * Send location details to confirmed invitees
   */
  sendLocationDetails(
    invitees: Invitee[],
    locationTemplate: MessageTemplate
  ): Observable<any> {
    return this.sendBulkMessages(invitees, locationTemplate);
  }

  /**
   * Schedule future messages (this would require a server-side implementation)
   */
  scheduleMessage(
    invitee: Invitee,
    template: MessageTemplate,
    scheduledDate: Date
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedule-message`, {
      to: `whatsapp:${invitee.phone_number}`,
      body: template.body
        .replace('{{firstName}}', invitee.first_name)
        .replace('{{lastName}}', invitee.last_name)
        .replace('{{fullName}}', `${invitee.first_name} ${invitee.last_name}`),
      scheduledDate: scheduledDate.toISOString(),
    });
  }
}
