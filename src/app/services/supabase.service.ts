import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Invitee, RSVPStatus } from '../models/invitee.model';
import { MessageTemplate } from '../models/message-template.model';
import { MessageHistory } from '../models/message-history.model';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Replace with your actual Supabase URL and key in the environment config
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Invitee methods
  async getAllInvitees(): Promise<Invitee[]> {
    const { data, error } = await this.supabase
      .from('invitees')
      .select('*')
      .order('lastName', { ascending: true });

    if (error) {
      console.error('Error fetching invitees:', error);
      throw error;
    }
    return data || [];
  }

  async getInviteesByStatus(status: RSVPStatus): Promise<Invitee[]> {
    const { data, error } = await this.supabase
      .from('invitees')
      .select('*')
      .eq('rsvpStatus', status)
      .order('lastName', { ascending: true });

    if (error) {
      console.error(`Error fetching invitees with status ${status}:`, error);
      throw error;
    }
    return data || [];
  }

  async getInviteeById(id: string): Promise<Invitee | null> {
    const { data, error } = await this.supabase
      .from('invitees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching invitee with id ${id}:`, error);
      throw error;
    }
    return data;
  }

  async createInvitee(invitee: Invitee): Promise<Invitee> {
    const { data, error } = await this.supabase
      .from('invitees')
      .insert([{ ...invitee, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating invitee:', error);
      throw error;
    }
    return data;
  }

  async updateInvitee(id: string, invitee: Partial<Invitee>): Promise<Invitee> {
    const { data, error } = await this.supabase
      .from('invitees')
      .update({ ...invitee, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating invitee with id ${id}:`, error);
      throw error;
    }
    return data;
  }

  async updateInviteeRSVP(
    id: string,
    status: RSVPStatus,
    additionalInfo?: string
  ): Promise<Invitee> {
    const updateData: Partial<Invitee> = {
      rsvpStatus: status,
      updatedAt: new Date(),
    };

    if (additionalInfo) {
      updateData.additionalInfo = additionalInfo;
    }

    const { data, error } = await this.supabase
      .from('invitees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating RSVP status for invitee ${id}:`, error);
      throw error;
    }
    return data;
  }

  async deleteInvitee(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('invitees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting invitee with id ${id}:`, error);
      throw error;
    }
  }

  // Message Template methods
  async getAllMessageTemplates(): Promise<MessageTemplate[]> {
    const { data, error } = await this.supabase
      .from('message_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching message templates:', error);
      throw error;
    }
    return data || [];
  }

  async getMessageTemplateById(id: string): Promise<MessageTemplate | null> {
    const { data, error } = await this.supabase
      .from('message_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching message template with id ${id}:`, error);
      throw error;
    }
    return data;
  }

  async createMessageTemplate(
    template: MessageTemplate
  ): Promise<MessageTemplate> {
    const { data, error } = await this.supabase
      .from('message_templates')
      .insert([{ ...template, createdAt: new Date(), updatedAt: new Date() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating message template:', error);
      throw error;
    }
    return data;
  }

  async updateMessageTemplate(
    id: string,
    template: Partial<MessageTemplate>
  ): Promise<MessageTemplate> {
    const { data, error } = await this.supabase
      .from('message_templates')
      .update({ ...template, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating message template with id ${id}:`, error);
      throw error;
    }
    return data;
  }

  async deleteMessageTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('message_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting message template with id ${id}:`, error);
      throw error;
    }
  }

  // Message History methods
  async getMessageHistory(inviteeId?: string): Promise<MessageHistory[]> {
    let query = this.supabase
      .from('message_history')
      .select('*')
      .order('sentAt', { ascending: false });

    if (inviteeId) {
      query = query.eq('inviteeId', inviteeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching message history:', error);
      throw error;
    }
    return data || [];
  }

  async recordMessageSent(
    messageHistory: MessageHistory
  ): Promise<MessageHistory> {
    const { data, error } = await this.supabase
      .from('message_history')
      .insert([messageHistory])
      .select()
      .single();

    if (error) {
      console.error('Error recording message history:', error);
      throw error;
    }
    return data;
  }

  async updateMessageStatus(
    id: string,
    status: 'delivered' | 'failed' | 'pending'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('message_history')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(`Error updating message status for id ${id}:`, error);
      throw error;
    }
  }

  async recordMessageResponse(id: string, responseText: string): Promise<void> {
    const { error } = await this.supabase
      .from('message_history')
      .update({
        responseReceived: true,
        responseText,
        responseReceivedAt: new Date(),
      })
      .eq('id', id);

    if (error) {
      console.error(`Error recording message response for id ${id}:`, error);
      throw error;
    }
  }
}
