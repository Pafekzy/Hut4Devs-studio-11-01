/**
 * Hut4Devs Accommodation Welfare & Mediation Store
 *
 * Scoped operational store for living conditions, roommate mediation,
 * facility escalations, and accommodation wellbeing.
 *
 * Invariants:
 * - Role-scoped: Only Accommodation Welfare & Mediation Officer may advance mediation states or escalate to facility.
 * - Does NOT hold membership decision authority.
 * - Does NOT touch PostgreSQL financial tables or payment intents.
 * - Facts over narratives: append-oriented event audit trail on every case.
 * - Honest persistence reporting: explicitly marks seed data / local fallback.
 */

import {
  WelfareCase,
  WelfareCaseEvent,
  CreateWelfareCaseInput,
  AddRestorativeNoteInput,
  AdvanceWelfareStatusInput,
  EscalateFacilityInput,
} from '../domain/welfareMediation';
import { Member, MemberRole } from '../domain/auth';
import { FeedbackStatus, PersistenceClassification } from '../domain/puzzleFeedback';
import { notificationStore } from './notificationStore';

const STORAGE_KEY = 'h4d_welfare_mediation_cases';

export const INITIAL_SEEDED_WELFARE_CASES: WelfareCase[] = [
  {
    id: 'wel-case-001',
    caseNumber: 'WEL-2026-001',
    title: 'Room 304 & 306 Cross-Ventilation & Stagnant Air During Evening Power Swap',
    description:
      'During evening generator changeover, corridor transom louvers are locked, causing heat buildup and stagnant air in Rooms 304 and 306. Requesting inspection of corridor windows and extractor vent servicing.',
    category: 'LIVING_CONDITIONS',
    priority: 'NORMAL',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 3',
    roomName: 'Room 304',
    reporterDisplayName: 'Chinedu Okeke',
    reporterEmail: 'chinedu.captain@infinitegrace.local',
    affectedResidents: ['Chinedu Okeke', 'Emmanuel Ukom', 'Room 306 Residents'],
    involvementPreference: 'HELP_TEST',
    status: 'UNDER_REVIEW',
    escalatedToFacility: false,
    restorativeNotes: [
      {
        id: 'note-001-1',
        authorName: 'Arc. Olumide Adeleke',
        authorCapacity: 'Accommodation Welfare & Mediation Officer',
        content:
          'Inspected 3rd floor corridor during 7:00 PM power changeover. Confirmed transom latch on south window is jammed shut. Contacted building caretaker to free the latch and clean the screen mesh.',
        timestamp: '2026-09-09T18:45:00.000Z',
      },
    ],
    events: [
      {
        eventId: 'evt-wel-001-1',
        caseId: 'wel-case-001',
        actorMemberId: 'member-chinedu-captain',
        actorDisplayName: 'Chinedu Okeke',
        actorCapacity: 'Room Captain (Room 304)',
        eventType: 'CASE_LOGGED',
        timestamp: '2026-09-08T20:15:00.000Z',
        message: 'Concern logged regarding corridor ventilation latch and room airflow during power switchovers.',
      },
      {
        eventId: 'evt-wel-001-2',
        caseId: 'wel-case-001',
        actorMemberId: 'member-welfare-mediation-officer',
        actorDisplayName: 'Arc. Olumide Adeleke',
        actorCapacity: 'Accommodation Welfare & Mediation Officer',
        eventType: 'ACKNOWLEDGED',
        timestamp: '2026-09-09T09:30:00.000Z',
        message: 'Concern acknowledged. On-site inspection scheduled for evening changeover.',
      },
    ],
    createdAt: '2026-09-08T20:15:00.000Z',
    updatedAt: '2026-09-09T18:45:00.000Z',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
  },
  {
    id: 'wel-case-002',
    caseNumber: 'WEL-2026-002',
    title: 'BedRock Room 201 Late-Night Pair-Programming Audio & Mechanical Keyboards',
    description:
      'Friction between roommates regarding midnight debugging sessions and mechanical keyboard clicks during sprint deadlines. Resident requesting restorative conversation on quiet hours etiquette.',
    category: 'INTERPERSONAL_CONFLICT',
    priority: 'MONITORING',
    propertyId: 'prop-bedrock-hostel',
    propertyName: 'BedRock Hostel',
    floorName: 'Floor 2',
    roomName: 'Room 201',
    reporterDisplayName: 'Nonso Okafor',
    reporterEmail: 'nonso@devs.local',
    affectedResidents: ['Nonso Okafor', 'Tunde Bakare'],
    involvementPreference: 'CONTACT_ME',
    status: 'IN_PROGRESS',
    escalatedToFacility: false,
    restorativeNotes: [
      {
        id: 'note-002-1',
        authorName: 'Arc. Olumide Adeleke',
        authorCapacity: 'Accommodation Welfare & Mediation Officer',
        content:
          'Convened structured mediation with both roommates. Established that sprint pressure was elevated due to cohort project milestone. Both fellows agreed to clear quiet boundaries.',
        timestamp: '2026-09-10T16:00:00.000Z',
      },
    ],
    mediationAgreement: {
      recordedAt: '2026-09-10T16:30:00.000Z',
      recordedBy: 'Arc. Olumide Adeleke (Accommodation Welfare & Mediation Officer)',
      summary:
        'Quiet hours established inside Room 201 from 11:30 PM to 7:00 AM. Ground floor communal lounge designated for late-night sprints.',
      actionItems: [
        'Late coding after 11:30 PM moves to Ground Floor Lounge',
        'Headphones mandatory for all screen shares and audio calls after 10:00 PM',
        'Direct check-in between roommates every Sunday before sprint kickoff',
      ],
      reviewDate: '2026-09-24',
    },
    events: [
      {
        eventId: 'evt-wel-002-1',
        caseId: 'wel-case-002',
        actorMemberId: 'member-nonso-transfer',
        actorDisplayName: 'Nonso Okafor',
        actorCapacity: 'Fellow',
        eventType: 'CASE_LOGGED',
        timestamp: '2026-09-09T23:30:00.000Z',
        message: 'Mediation requested regarding nighttime typing noise and rest disruption.',
      },
      {
        eventId: 'evt-wel-002-2',
        caseId: 'wel-case-002',
        actorMemberId: 'member-welfare-mediation-officer',
        actorDisplayName: 'Arc. Olumide Adeleke',
        actorCapacity: 'Accommodation Welfare & Mediation Officer',
        eventType: 'MEDIATION_SCHEDULED',
        timestamp: '2026-09-10T10:00:00.000Z',
        message: 'Restorative dialogue convened in campus welfare annex.',
      },
      {
        eventId: 'evt-wel-002-3',
        caseId: 'wel-case-002',
        actorMemberId: 'member-welfare-mediation-officer',
        actorDisplayName: 'Arc. Olumide Adeleke',
        actorCapacity: 'Accommodation Welfare & Mediation Officer',
        eventType: 'STATUS_CHANGED',
        timestamp: '2026-09-10T16:30:00.000Z',
        message: 'Mediation agreement recorded. Active monitoring in progress until review date.',
      },
    ],
    createdAt: '2026-09-09T23:30:00.000Z',
    updatedAt: '2026-09-10T16:30:00.000Z',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
  },
  {
    id: 'wel-case-003',
    caseNumber: 'WEL-2026-003',
    title: 'Floor 3 Water Pressure Inconsistency During Morning Standup Rush',
    description:
      'Secondary booster pump trips on breaker between 7:30 AM and 8:45 AM, reducing 3rd floor bathroom water pressure to a trickle when multiple residents prepare for daily standups.',
    category: 'FACILITY_ESCALATION',
    priority: 'URGENT',
    propertyId: 'prop-infinite-grace',
    propertyName: 'Infinite Grace Apartment',
    floorName: 'Floor 3',
    roomName: 'Floor 3 Bathrooms A & B',
    reporterDisplayName: 'Zainab Aliyu',
    reporterEmail: 'coordinator@l2e.local',
    affectedResidents: ['All Floor 3 Residents (Rooms 301–306)'],
    involvementPreference: 'HELP_TEST',
    status: 'UNDER_REVIEW',
    escalatedToFacility: true,
    facilityEscalationDetails: {
      escalatedAt: '2026-09-11T11:00:00.000Z',
      escalatedBy: 'Arc. Olumide Adeleke (Accommodation Welfare & Mediation Officer)',
      targetRecipient: 'Infinite Grace Facility Management (Engr. Taiwo)',
      reason: 'Breaker rating on secondary booster pump is undersized for peak concurrent draw.',
      targetResolutionDate: '2026-09-14',
    },
    restorativeNotes: [
      {
        id: 'note-003-1',
        authorName: 'Arc. Olumide Adeleke',
        authorCapacity: 'Accommodation Welfare & Mediation Officer',
        content:
          'Escalated directly to Engr. Taiwo. Facility electrician scheduled breaker replacement and capacitor check for Monday morning. Advised Room Captain Chinedu to inform residents of the service window.',
        timestamp: '2026-09-11T11:30:00.000Z',
      },
    ],
    events: [
      {
        eventId: 'evt-wel-003-1',
        caseId: 'wel-case-003',
        actorMemberId: 'member-zainab-coordinator',
        actorDisplayName: 'Zainab Aliyu',
        actorCapacity: 'Fellow',
        eventType: 'CASE_LOGGED',
        timestamp: '2026-09-11T09:00:00.000Z',
        message: 'Water pressure failure reported affecting morning readiness across 3rd floor.',
      },
      {
        eventId: 'evt-wel-003-2',
        caseId: 'wel-case-003',
        actorMemberId: 'member-welfare-mediation-officer',
        actorDisplayName: 'Arc. Olumide Adeleke',
        actorCapacity: 'Accommodation Welfare & Mediation Officer',
        eventType: 'FACILITY_ESCALATED',
        timestamp: '2026-09-11T11:00:00.000Z',
        message: 'Formal facility ticket dispatched to Engr. Taiwo with target fix window.',
      },
    ],
    createdAt: '2026-09-11T09:00:00.000Z',
    updatedAt: '2026-09-11T11:30:00.000Z',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
  },
  {
    id: 'wel-case-004',
    caseNumber: 'WEL-2026-004',
    title: 'MainBase Communal Kitchen Fridge Shelf Space & Disposal Protocol',
    description:
      'Unlabelled containers and expired leftovers accumulating in the shared refrigerator leading to friction between resident cohorts. Requesting clear shelf assignment per room.',
    category: 'LIVING_CONDITIONS',
    priority: 'NORMAL',
    propertyId: 'prop-mainbase',
    propertyName: 'MainBase Apartments',
    floorName: 'Floor 1',
    roomName: 'Communal Kitchen',
    reporterDisplayName: 'Amina Bello',
    reporterEmail: 'amina.bello@mainbase.local',
    affectedResidents: ['MainBase Apartment Residents'],
    involvementPreference: 'CONSULT_DESIGN',
    status: 'IMPLEMENTED',
    escalatedToFacility: false,
    restorativeNotes: [
      {
        id: 'note-004-1',
        authorName: 'Arc. Olumide Adeleke',
        authorCapacity: 'Accommodation Welfare & Mediation Officer',
        content:
          'Met with MainBase floor representatives. Provided color-coded vinyl shelf labels for each room and placed permanent markers on the fridge door. Weekly cleanout agreed for Fridays at 6:00 PM.',
        timestamp: '2026-09-08T17:00:00.000Z',
      },
    ],
    mediationAgreement: {
      recordedAt: '2026-09-08T17:30:00.000Z',
      recordedBy: 'Arc. Olumide Adeleke (Accommodation Welfare & Mediation Officer)',
      summary: 'Refrigerator shelf allocation by room with weekly communal inspection on Fridays.',
      actionItems: [
        'Shelves 1-4 labelled by room number',
        'Containers must have resident initials and date sticker',
        'Unmarked containers cleared during Friday 6:00 PM floor sanitation',
      ],
    },
    events: [
      {
        eventId: 'evt-wel-004-1',
        caseId: 'wel-case-004',
        actorMemberId: 'mem-3',
        actorDisplayName: 'Amina Bello',
        actorCapacity: 'Fellow',
        eventType: 'CASE_LOGGED',
        timestamp: '2026-09-07T12:00:00.000Z',
        message: 'Kitchen storage friction reported.',
      },
      {
        eventId: 'evt-wel-004-2',
        caseId: 'wel-case-004',
        actorMemberId: 'member-welfare-mediation-officer',
        actorDisplayName: 'Arc. Olumide Adeleke',
        actorCapacity: 'Accommodation Welfare & Mediation Officer',
        eventType: 'RESOLVED',
        timestamp: '2026-09-10T14:00:00.000Z',
        message: 'Follow-up check verified all shelves labelled and cleanout system working smoothly.',
      },
    ],
    createdAt: '2026-09-07T12:00:00.000Z',
    updatedAt: '2026-09-10T14:00:00.000Z',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
  },
  {
    id: 'wel-case-005',
    caseNumber: 'WEL-2026-005',
    title: 'Fellow Recovery & Post-Malaria Academic Sprint Wellbeing Follow-up',
    description:
      'Fellow recovering from malaria episode following intensive hackathon week. Fellow experiencing exhaustion and needs accommodation adjustment support for rest and meal delivery coordination.',
    category: 'WELLBEING_SUPPORT',
    priority: 'NORMAL',
    propertyId: 'prop-bedrock-hostel',
    propertyName: 'BedRock Hostel',
    floorName: 'Floor 1',
    roomName: 'Room 104',
    reporterDisplayName: 'Emmanuel Ukom',
    reporterEmail: 'emmanuel@infinitegrace.local',
    affectedResidents: ['Segun Adeleke'],
    involvementPreference: 'CONTACT_ME',
    status: 'PENDING_REVIEW',
    escalatedToFacility: false,
    restorativeNotes: [],
    events: [
      {
        eventId: 'evt-wel-005-1',
        caseId: 'wel-case-005',
        actorMemberId: 'member-emmanuel-fellow',
        actorDisplayName: 'Emmanuel Ukom',
        actorCapacity: 'Fellow (Peer Referral)',
        eventType: 'CASE_LOGGED',
        timestamp: '2026-09-12T08:30:00.000Z',
        message: 'Peer welfare check referral submitted for Segun Adeleke.',
      },
    ],
    createdAt: '2026-09-12T08:30:00.000Z',
    updatedAt: '2026-09-12T08:30:00.000Z',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
  },
];

export class WelfareMediationStore {
  private cases: WelfareCase[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadLocal();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private loadLocal(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cases = parsed;
            return;
          }
        }
      }
    } catch {
      // Ignore parse failure
    }
    this.cases = JSON.parse(JSON.stringify(INITIAL_SEEDED_WELFARE_CASES));
    this.saveLocal();
  }

  private saveLocal(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cases));
      }
    } catch {
      // Ignore write errors
    }
  }

  public isWelfareOfficer(member?: Member | null): boolean {
    if (!member) return false;
    return (
      member.roles.includes(MemberRole.WELFARE_MEDIATION_OFFICER) ||
      member.roles.some((r) => String(r).includes('WELFARE') || String(r).includes('MEDIATION')) ||
      member.id.includes('welfare') ||
      member.id.includes('mediation')
    );
  }

  public getCases(): WelfareCase[] {
    return [...this.cases];
  }

  public getCaseById(id: string): WelfareCase | undefined {
    return this.cases.find((c) => c.id === id);
  }

  /**
   * Log a new accommodation welfare concern.
   * Can be reported by residents or logged by Welfare Officer during walk-throughs.
   */
  public createCase(input: CreateWelfareCaseInput, actor?: Member | null): WelfareCase {
    const id = `wel-case-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date().toISOString();
    const caseSeq = (this.cases.length + 1).toString().padStart(3, '0');
    const caseNumber = `WEL-2026-${caseSeq}`;

    const actorName = actor?.displayName || input.reporterDisplayName || 'Accommodation Resident';
    const actorCapacity = actor ? (this.isWelfareOfficer(actor) ? 'Accommodation Welfare & Mediation Officer' : 'Fellow') : 'Resident';

    const createEvent: WelfareCaseEvent = {
      eventId: `evt-wel-${Date.now().toString(36)}-1`,
      caseId: id,
      actorMemberId: actor?.id || 'anonymous',
      actorDisplayName: actorName,
      actorCapacity,
      eventType: 'CASE_LOGGED',
      timestamp: now,
      message: `Concern logged: "${input.title}".`,
    };

    const newCase: WelfareCase = {
      id,
      caseNumber,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority || 'NORMAL',
      propertyId: input.propertyId,
      propertyName: input.propertyName,
      floorName: input.floorName,
      roomName: input.roomName,
      reporterMemberId: actor?.id || input.reporterMemberId,
      reporterDisplayName: input.reporterDisplayName || actorName,
      reporterEmail: input.reporterEmail || actor?.email,
      affectedResidents: input.affectedResidents && input.affectedResidents.length > 0 ? input.affectedResidents : [actorName],
      involvementPreference: input.involvementPreference || 'JUST_LOG',
      status: 'PENDING_REVIEW',
      events: [createEvent],
      restorativeNotes: [],
      escalatedToFacility: false,
      createdAt: now,
      updatedAt: now,
      persistenceClassification: 'DEMO_LOCAL_FALLBACK',
    };

    this.cases.unshift(newCase);
    this.saveLocal();
    this.notify();

    return newCase;
  }

  /**
   * Acknowledge concern and set status to UNDER_REVIEW.
   * Welfare & Mediation authority action.
   */
  public acknowledgeCase(caseId: string, actor: Member, note?: string): WelfareCase {
    const target = this.cases.find((c) => c.id === caseId);
    if (!target) throw new Error(`Welfare case not found: ${caseId}`);

    const now = new Date().toISOString();
    const event: WelfareCaseEvent = {
      eventId: `evt-wel-${Date.now().toString(36)}`,
      caseId,
      actorMemberId: actor.id,
      actorDisplayName: actor.displayName,
      actorCapacity: 'Accommodation Welfare & Mediation Officer',
      eventType: 'ACKNOWLEDGED',
      timestamp: now,
      message: note || 'Concern acknowledged by Accommodation Welfare & Mediation Officer.',
    };

    target.status = 'UNDER_REVIEW';
    target.updatedAt = now;
    target.events.push(event);

    if (note && note.trim().length > 0) {
      target.restorativeNotes.push({
        id: `note-${Date.now().toString(36)}`,
        authorName: actor.displayName,
        authorCapacity: 'Accommodation Welfare & Mediation Officer',
        content: note.trim(),
        timestamp: now,
      });
    }

    this.saveLocal();
    this.notify();

    if (target.reporterMemberId) {
      notificationStore.addNotification({
        memberId: target.reporterMemberId,
        title: 'Welfare Concern Acknowledged',
        message: `Your concern "${target.title}" is under review by ${actor.displayName}.`,
        feedbackId: target.id,
        type: 'FEEDBACK_ACKNOWLEDGED',
      });
    }

    return target;
  }

  /**
   * Add a restorative note or mediation update.
   */
  public addRestorativeNote(input: AddRestorativeNoteInput): WelfareCase {
    const target = this.cases.find((c) => c.id === input.caseId);
    if (!target) throw new Error(`Welfare case not found: ${input.caseId}`);

    const now = new Date().toISOString();
    const noteId = `note-${Date.now().toString(36)}`;
    target.restorativeNotes.push({
      id: noteId,
      authorName: input.authorDisplayName,
      authorCapacity: input.authorCapacity,
      content: input.content.trim(),
      timestamp: now,
    });

    const event: WelfareCaseEvent = {
      eventId: `evt-wel-${Date.now().toString(36)}`,
      caseId: input.caseId,
      actorMemberId: input.authorMemberId,
      actorDisplayName: input.authorDisplayName,
      actorCapacity: input.authorCapacity,
      eventType: 'RESTORATIVE_NOTE_ADDED',
      timestamp: now,
      message: `Restorative note added: ${input.content.substring(0, 100)}${input.content.length > 100 ? '...' : ''}`,
    };
    target.events.push(event);
    target.updatedAt = now;

    this.saveLocal();
    this.notify();

    if (target.reporterMemberId) {
      notificationStore.addNotification({
        memberId: target.reporterMemberId,
        title: 'Mediation Note Recorded',
        message: `A restorative note was recorded on case "${target.title}" by ${input.authorDisplayName}.`,
        feedbackId: target.id,
        type: 'STATUS_CHANGED',
      });
    }

    return target;
  }

  /**
   * Record a restorative roommate agreement.
   */
  public recordMediationAgreement(
    caseId: string,
    actor: Member,
    summary: string,
    actionItems: string[],
    reviewDate?: string
  ): WelfareCase {
    const target = this.cases.find((c) => c.id === caseId);
    if (!target) throw new Error(`Welfare case not found: ${caseId}`);

    const now = new Date().toISOString();
    target.mediationAgreement = {
      recordedAt: now,
      recordedBy: `${actor.displayName} (Accommodation Welfare & Mediation Officer)`,
      summary,
      actionItems,
      reviewDate,
    };
    target.status = 'IN_PROGRESS';
    target.updatedAt = now;

    const event: WelfareCaseEvent = {
      eventId: `evt-wel-${Date.now().toString(36)}`,
      caseId,
      actorMemberId: actor.id,
      actorDisplayName: actor.displayName,
      actorCapacity: 'Accommodation Welfare & Mediation Officer',
      eventType: 'MEDIATION_SCHEDULED',
      timestamp: now,
      message: `Mediation agreement recorded: ${summary}`,
    };
    target.events.push(event);

    this.saveLocal();
    this.notify();

    if (target.reporterMemberId) {
      notificationStore.addNotification({
        memberId: target.reporterMemberId,
        title: 'Restorative Agreement Established',
        message: `A restorative agreement was recorded for "${target.title}". Action items have been logged.`,
        feedbackId: target.id,
        type: 'STATUS_CHANGED',
      });
    }

    return target;
  }

  /**
   * Escalate issue to property facility management.
   */
  public escalateToFacility(input: EscalateFacilityInput): WelfareCase {
    const target = this.cases.find((c) => c.id === input.caseId);
    if (!target) throw new Error(`Welfare case not found: ${input.caseId}`);

    const now = new Date().toISOString();
    target.escalatedToFacility = true;
    target.facilityEscalationDetails = {
      escalatedAt: now,
      escalatedBy: `${input.actorDisplayName} (${input.actorCapacity})`,
      targetRecipient: input.targetRecipient,
      reason: input.reason,
      targetResolutionDate: input.targetResolutionDate,
    };
    target.updatedAt = now;

    const event: WelfareCaseEvent = {
      eventId: `evt-wel-${Date.now().toString(36)}`,
      caseId: input.caseId,
      actorMemberId: input.actorMemberId,
      actorDisplayName: input.actorDisplayName,
      actorCapacity: input.actorCapacity,
      eventType: 'FACILITY_ESCALATED',
      timestamp: now,
      message: `Escalated to facility stakeholder (${input.targetRecipient}): ${input.reason}`,
    };
    target.events.push(event);

    this.saveLocal();
    this.notify();

    return target;
  }

  /**
   * Advance status along canonical lifecycle:
   * PENDING_REVIEW -> UNDER_REVIEW -> IN_PROGRESS -> IMPLEMENTED
   */
  public advanceStatus(input: AdvanceWelfareStatusInput): WelfareCase {
    const target = this.cases.find((c) => c.id === input.caseId);
    if (!target) throw new Error(`Welfare case not found: ${input.caseId}`);

    const now = new Date().toISOString();
    const prevStatus = target.status;
    target.status = input.newStatus;
    target.updatedAt = now;

    const eventType = input.newStatus === 'IMPLEMENTED' ? 'RESOLVED' : 'STATUS_CHANGED';

    const event: WelfareCaseEvent = {
      eventId: `evt-wel-${Date.now().toString(36)}`,
      caseId: input.caseId,
      actorMemberId: input.actorMemberId,
      actorDisplayName: input.actorDisplayName,
      actorCapacity: input.actorCapacity,
      eventType,
      timestamp: now,
      message: `Status transitioned from ${prevStatus} to ${input.newStatus}.${input.note ? ` Note: ${input.note}` : ''}`,
    };
    target.events.push(event);

    if (input.note && input.note.trim().length > 0) {
      target.restorativeNotes.push({
        id: `note-${Date.now().toString(36)}`,
        authorName: input.actorDisplayName,
        authorCapacity: input.actorCapacity,
        content: input.note.trim(),
        timestamp: now,
      });
    }

    this.saveLocal();
    this.notify();

    if (target.reporterMemberId) {
      notificationStore.addNotification({
        memberId: target.reporterMemberId,
        title: input.newStatus === 'IMPLEMENTED' ? 'Welfare Concern Resolved' : 'Welfare Status Updated',
        message: `Your concern "${target.title}" is now ${input.newStatus}.${input.note ? ` Note: ${input.note}` : ''}`,
        feedbackId: target.id,
        type: input.newStatus === 'IMPLEMENTED' ? 'RESOLVED' : 'STATUS_CHANGED',
      });
    }

    return target;
  }

  public resetToInitial(): void {
    this.cases = JSON.parse(JSON.stringify(INITIAL_SEEDED_WELFARE_CASES));
    this.saveLocal();
    this.notify();
  }
}

export const welfareMediationStore = new WelfareMediationStore();
