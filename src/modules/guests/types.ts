export interface GuestLite {
  id: string;
  name: string;
  isPrimary: boolean;
}

/** A group with its members and the set of events it's invited to. */
export interface GroupDetail {
  id: string;
  name: string;
  guests: GuestLite[];
  invitedEventIds: string[];
  hasInvite: boolean;
}
