/**
 * Typed application errors. Thrown by module `server/` code and translated to
 * HTTP responses / redirects at the routing boundary. Keeping them typed lets
 * us distinguish "not allowed" from "not found" from "bad input" without
 * leaking details to guests.
 */

export type AppErrorCode =
  | "UNAUTHORIZED" // no valid identity (admin not logged in / no guest session)
  | "FORBIDDEN" // valid identity, but not allowed to access this resource
  | "NOT_FOUND"
  | "VALIDATION";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Not authenticated") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Not authorized") {
    super("FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input") {
    super("VALIDATION", message);
    this.name = "ValidationError";
  }
}
