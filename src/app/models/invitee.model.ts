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
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  numberOfGuests: number;
  relation: RelationType;
  rsvpStatus: RSVPStatus;
  dietaryRestrictions?: string;
  specialRequests?: string;
  lastContacted?: Date;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
