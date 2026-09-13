/**
 * Hut4Devs Accommodation Welfare & Mediation Domain
 *
 * Core Principles:
 * - "Capability is not authority."
 * - "People present narratives. The platform preserves facts."
 * - Scoped responsibility: Living conditions, interpersonal roommate mediation,
 *   environmental escalations, and accommodation wellbeing support.
 * - Does NOT hold membership decision authority (retained by Accommodation Coordinator).
 * - Does NOT hold financial administration or reconciliation authority (retained by Financial Admin).
 * - Preserves canonical Missing Puzzle feedback lifecycle:
 *   PENDING_REVIEW -> UNDER_REVIEW -> IN_PROGRESS -> IMPLEMENTED.
 */

import { FeedbackStatus, MissingPuzzleInvolvement, PersistenceClassification } from './puzzleFeedback';

export type WelfareCategory =
  | 'LIVING_CONDITIONS' // Ventilation, air quality, sanitation, water supply, hygiene
  | 'INTERPERSONAL_CONFLICT' // Roommate disputes, night-time habits, noise friction, shared space etiquette
  | 'FACILITY_ESCALATION' // Plumbing, electrical fixtures, infrastructure defects needing property attention
  | 'WELLBEING_SUPPORT' // Health recovery, burnout support, accommodation adjustment
  | 'NOISE_AND_ENVIRONMENT'; // Late night pairing/typing audio, loud calls during rest hours

export type WelfareCasePriority = 'NORMAL' | 'URGENT' | 'MONITORING';

export type WelfareEventType =
  | 'CASE_LOGGED'
  | 'ACKNOWLEDGED'
  | 'MEDIATION_SCHEDULED'
  | 'RESTORATIVE_NOTE_ADDED'
  | 'FACILITY_ESCALATED'
  | 'STATUS_CHANGED'
  | 'RESOLVED';

export interface WelfareCaseEvent {
  eventId: string;
  caseId: string;
  actorMemberId: string;
  actorDisplayName: string;
  actorCapacity: string;
  eventType: WelfareEventType;
  timestamp: string;
  message: string;
  details?: Record<string, any>;
}

export interface WelfareCase {
  id: string;
  caseNumber: string; // e.g. WEL-2026-001
  title: string;
  description: string;
  category: WelfareCategory;
  priority: WelfareCasePriority;

  // Accommodation Scope
  propertyId: string;
  propertyName: string;
  floorName: string;
  roomName: string;

  // Human context
  reporterMemberId?: string;
  reporterDisplayName: string;
  reporterEmail?: string;
  affectedResidents: string[]; // names of residents involved or in the shared room
  involvementPreference: MissingPuzzleInvolvement;

  // Canonical Feedback Lifecycle Status
  status: FeedbackStatus; // PENDING_REVIEW | UNDER_REVIEW | IN_PROGRESS | IMPLEMENTED

  // Append-oriented audit trails
  events: WelfareCaseEvent[];
  restorativeNotes: Array<{
    id: string;
    authorName: string;
    authorCapacity: string;
    content: string;
    timestamp: string;
  }>;

  // Facility Escalation details (if escalated to property management)
  escalatedToFacility: boolean;
  facilityEscalationDetails?: {
    escalatedAt: string;
    escalatedBy: string;
    targetRecipient: string; // e.g. "Infinite Grace Facility Management"
    reason: string;
    targetResolutionDate?: string;
  };

  // Mediation Agreements (restorative agreement between roommates)
  mediationAgreement?: {
    recordedAt: string;
    recordedBy: string;
    summary: string;
    actionItems: string[];
    reviewDate?: string;
  };

  createdAt: string;
  updatedAt: string;
  persistenceClassification: PersistenceClassification;
}

export interface CreateWelfareCaseInput {
  title: string;
  description: string;
  category: WelfareCategory;
  priority?: WelfareCasePriority;
  propertyId: string;
  propertyName: string;
  floorName: string;
  roomName: string;
  reporterMemberId?: string;
  reporterDisplayName: string;
  reporterEmail?: string;
  affectedResidents?: string[];
  involvementPreference?: MissingPuzzleInvolvement;
}

export interface AddRestorativeNoteInput {
  caseId: string;
  authorMemberId: string;
  authorDisplayName: string;
  authorCapacity: string;
  content: string;
}

export interface AdvanceWelfareStatusInput {
  caseId: string;
  actorMemberId: string;
  actorDisplayName: string;
  actorCapacity: string;
  newStatus: FeedbackStatus;
  note: string;
}

export interface EscalateFacilityInput {
  caseId: string;
  actorMemberId: string;
  actorDisplayName: string;
  actorCapacity: string;
  targetRecipient: string;
  reason: string;
  targetResolutionDate?: string;
}
