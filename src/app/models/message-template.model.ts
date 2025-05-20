export interface MessageTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: 'invitation' | 'reminder' | 'confirmation' | 'location' | 'custom';
  createdAt?: Date;
  updatedAt?: Date;
}
