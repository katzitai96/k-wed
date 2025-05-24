export enum RelationType {
  Family = 'family',
  Friend = 'friend',
  Colleague = 'colleague',
  Other = 'other',
}

export enum RSVPStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Declined = 'declined',
  Maybe = 'maybe',
}

export interface Invitee {
  id?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  number_of_guests: number;
  relation: RelationType;
  rsvp_status: RSVPStatus;
  dietary_restrictions?: string;
  special_requests?: string;
  last_contacted?: Date;
  additional_info?: string;
  created_at?: Date;
  updated_at?: Date;
}
