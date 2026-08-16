/**
 * Domain type for a `pending_signups` row — a self-serve purchase in progress.
 * Hand-written to match `modules/weddings/types.ts`.
 */
export type SignupStatus = "draft" | "paid" | "expired";

export interface PendingSignup {
  id: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  themeId: string;
  title: string;
  name1: string | null;
  name2: string | null;
  eventDate: string | null; // ISO date (YYYY-MM-DD)
  eventTime: string | null; // "HH:MM"
  amountPaise: number | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  status: SignupStatus;
  /** The invitation this signup produced, once payment activated it. */
  weddingId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape as stored in Postgres (snake_case), used only at the DB boundary. */
export interface PendingSignupRow {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone: string;
  theme_id: string;
  title: string;
  name1: string | null;
  name2: string | null;
  event_date: string | null;
  event_time: string | null;
  amount_paise: number | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: SignupStatus;
  wedding_id: string | null;
  created_at: string;
  updated_at: string;
}

export const SIGNUP_COLUMNS =
  "id, user_id, contact_name, contact_phone, theme_id, title, name1, name2, event_date, event_time, amount_paise, razorpay_order_id, razorpay_payment_id, status, wedding_id, created_at, updated_at";

export function mapSignupRow(row: PendingSignupRow): PendingSignup {
  return {
    id: row.id,
    userId: row.user_id,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    themeId: row.theme_id,
    title: row.title,
    name1: row.name1,
    name2: row.name2,
    eventDate: row.event_date,
    eventTime: row.event_time,
    amountPaise: row.amount_paise,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    status: row.status,
    weddingId: row.wedding_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
