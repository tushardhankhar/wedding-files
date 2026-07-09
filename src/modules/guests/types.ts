export interface GuestLite {
  id: string;
  name: string;
  isPrimary: boolean;
  phone: string | null;
}

/** A broadcast/share link scoped to all events or a chosen subset. */
export interface ShareLinkDetail {
  id: string;
  label: string;
  allEvents: boolean;
  eventIds: string[];
}

/** A group with its members and the set of events it's invited to. */
export interface GroupDetail {
  id: string;
  name: string;
  guests: GuestLite[];
  invitedEventIds: string[];
  hasInvite: boolean;
}
