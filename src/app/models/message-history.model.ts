export interface MessageHistory {
  id?: string;
  inviteeId: string;
  templateId?: string;
  messageBody: string;
  sentAt: Date;
  status: 'delivered' | 'failed' | 'pending';
  responseReceived?: boolean;
  responseText?: string;
  responseReceivedAt?: Date;
}
