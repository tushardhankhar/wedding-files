/**
 * The single self-serve price. One introductory offer, one product — there is
 * deliberately no plan/SKU concept here: the landing page's other plans (Save
 * the Date, the bundle) stay WhatsApp-booked.
 *
 * Paise is the unit Razorpay charges in, and it is the source of truth: the
 * amount sent to the order API is read from here on the SERVER and never from
 * the request body. A self-serve checkout that trusts a client-supplied amount
 * is the classic way to sell a ₹299 product for ₹1.
 */
export const PRICE_PAISE = 29_900;

/** Display form of {@link PRICE_PAISE}, for buttons and marketing copy. */
export const PRICE_LABEL = "₹299";

export const CURRENCY = "INR";
