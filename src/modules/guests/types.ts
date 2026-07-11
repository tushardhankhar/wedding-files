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
  /**
   * Plaintext token for re-displaying the link. Null for links created before
   * tokens were persisted — those must be regenerated to be revealed again.
   */
  token: string | null;
}

/** A group with its members and the set of events it's invited to. */
export interface GroupDetail {
  id: string;
  name: string;
  guests: GuestLite[];
  invitedEventIds: string[];
  hasInvite: boolean;
}
