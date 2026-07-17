export const databaseSchema = {
  profiles: "profiles",
  lawyerProfiles: "lawyer_profiles",
  appointments: "appointments",
  appointmentAuditLogs: "appointment_audit_logs",
  notificationDeliveries: "notification_deliveries",
  lawyerAvailability: "lawyer_availability",
  blockedTimes: "blocked_times",
  businessSettings: "business_settings",
  bookingRateLimits: "booking_rate_limits",
} as const;

export const databaseFunctions = {
  createPublicBookingRequest: "create_public_booking_request",
  incrementBookingRateLimit: "increment_booking_rate_limit",
} as const;
