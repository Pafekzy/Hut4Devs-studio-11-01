/**
 * Puzzle Feedback Store (H4D-DEMO-005)
 *
 * Upgraded from local demo store to SHARED OPERATIONAL PERSISTENCE with Firestore,
 * append-oriented history events, triage workflows, notifications, and honest
 * fallback classification.
 *
 * Invariant: Financial authority remains strictly PostgreSQL;
 * feedback records are NEVER mixed into financial authority tables.
 */

import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
} from './firebase';
import { Member, MemberRole } from '../domain/auth';
import {
  FeedbackStatus,
  MissingPuzzleInvolvement,
  FeedbackEventType,
  FeedbackEvent,
  SharedMissingPuzzleReport,
  CreateFeedbackInput,
  PersistenceClassification,
} from '../domain/puzzleFeedback';
import { notificationStore } from './notificationStore';

export type {
  FeedbackStatus,
  MissingPuzzleInvolvement,
  FeedbackEventType,
  FeedbackEvent,
  SharedMissingPuzzleReport,
  CreateFeedbackInput,
  PersistenceClassification,
};

// Backwards compatibility alias for H4D-DEMO-004 callers
export type MissingPuzzleReport = SharedMissingPuzzleReport;

const STORAGE_KEY = 'h4d_missing_puzzles_shared';

const INITIAL_SEEDED_REPORTS: SharedMissingPuzzleReport[] = [
  {
    id: 'puz-001',
    title: 'Offline receipts download should support PDF formatting',
    description:
      'When downloading accommodation verification receipts on mobile, text format works but a structured PDF would look cleaner for chamber records.',
    category: 'Accommodation Flow',
    locationContext: 'Responsibility Detail View',
    pageContext: 'Accommodation Responsibilities',
    routeContext: '/accommodation',
    reporterMemberId: 'mem-1',
    reporterDisplayName: 'Emmanuel Ukom',
    reporterEmail: 'emmanuel.ukom@infinitegrace.local',
    createdAt: '2026-09-08T14:30:00.000Z',
    updatedAt: '2026-09-08T14:30:00.000Z',
    puzzleCompleted: true,
    involvementPreference: 'HELP_TEST',
    status: 'UNDER_REVIEW',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
    events: [
      {
        eventId: 'evt-001-1',
        feedbackId: 'puz-001',
        actorMemberId: 'mem-1',
        actorDisplayName: 'Emmanuel Ukom',
        eventType: 'FEEDBACK_CREATED',
        timestamp: '2026-09-08T14:30:00.000Z',
        message: 'Report created via Missing Puzzle modal with HELP_TEST preference.',
      },
      {
        eventId: 'evt-001-2',
        feedbackId: 'puz-001',
        actorMemberId: 'coord-1',
        actorDisplayName: 'L2E Accommodation Fellows Coordinator',
        eventType: 'FEEDBACK_ACKNOWLEDGED',
        timestamp: '2026-09-08T16:00:00.000Z',
        message: 'Receipt PDF formatting request logged for accommodation engineering backlog.',
      },
    ],
    loggedBy: {
      id: 'mem-1',
      displayName: 'Emmanuel Ukom',
      h4dMemberId: 'H4D-00021',
      email: 'emmanuel.ukom@infinitegrace.local',
    },
    timestamp: '2026-09-08T14:30:00.000Z',
    involvement: 'HELP_TEST',
  },
  {
    id: 'puz-002',
    title: 'Mesh Wi-Fi shared campaign progress bar contrast in Dark Mode',
    description:
      'In dark mode, the green progress fill on the chamber inverter campaign card needs slightly higher luminance against the dark brown shell.',
    category: 'Visual / UI Glitch',
    locationContext: 'Peer Support Hub',
    pageContext: 'Peer Support',
    routeContext: '/peer-support',
    reporterMemberId: 'mem-2',
    reporterDisplayName: 'Nonso Okafor',
    reporterEmail: 'nonso.okafor@bedrock.local',
    createdAt: '2026-09-09T09:15:00.000Z',
    updatedAt: '2026-09-09T09:15:00.000Z',
    puzzleCompleted: true,
    involvementPreference: 'CONTRIBUTE_FIX',
    status: 'PENDING_REVIEW',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
    events: [
      {
        eventId: 'evt-002-1',
        feedbackId: 'puz-002',
        actorMemberId: 'mem-2',
        actorDisplayName: 'Nonso Okafor',
        eventType: 'FEEDBACK_CREATED',
        timestamp: '2026-09-09T09:15:00.000Z',
        message: 'Report logged with CONTRIBUTE_FIX preference.',
      },
    ],
    loggedBy: {
      id: 'mem-2',
      displayName: 'Nonso Okafor',
      h4dMemberId: 'H4D-00045',
      email: 'nonso.okafor@bedrock.local',
    },
    timestamp: '2026-09-09T09:15:00.000Z',
    involvement: 'CONTRIBUTE_FIX',
  },
  {
    id: 'puz-003',
    title: 'Institution-Controlled Branding & Payment Infrastructure',
    description:
      'Allow institutions and campuses to configure their own visual theme, custom logos, and pluggable payment provider adapters (e.g. BMONI, Sui, Stellar, or direct bank rails) with scoped authority without altering core accounting rules.',
    category: 'Idea / Missing Feature',
    locationContext: 'Governance / Institution Switcher',
    pageContext: 'Institution Governance',
    routeContext: '/governance',
    reporterMemberId: 'mem-3',
    reporterDisplayName: 'Amina Bello',
    reporterEmail: 'amina.bello@mainbase.local',
    createdAt: '2026-09-10T11:00:00.000Z',
    updatedAt: '2026-09-10T14:30:00.000Z',
    puzzleCompleted: true,
    involvementPreference: 'CONSULT_DESIGN',
    status: 'UNDER_REVIEW',
    persistenceClassification: 'DEMO_LOCAL_FALLBACK',
    events: [
      {
        eventId: 'evt-003-1',
        feedbackId: 'puz-003',
        actorMemberId: 'mem-3',
        actorDisplayName: 'Amina Bello',
        eventType: 'FEEDBACK_CREATED',
        timestamp: '2026-09-10T11:00:00.000Z',
        message: 'Report logged with CONSULT_DESIGN preference.',
      },
      {
        eventId: 'evt-003-2',
        feedbackId: 'puz-003',
        actorMemberId: 'coord-1',
        actorDisplayName: 'L2E Accommodation Fellows Coordinator',
        eventType: 'FEEDBACK_ACKNOWLEDGED',
        timestamp: '2026-09-10T14:30:00.000Z',
        message: 'Evaluated by Coordinator. Deferred for post-demo architecture roadmap to maintain BMONI provider boundary stability.',
      },
    ],
    loggedBy: {
      id: 'mem-3',
      displayName: 'Amina Bello',
      h4dMemberId: 'H4D-00088',
      email: 'amina.bello@mainbase.local',
    },
    timestamp: '2026-09-10T11:00:00.000Z',
    involvement: 'CONSULT_DESIGN',
  },
];

class PuzzleFeedbackStore {
  private reports: SharedMissingPuzzleReport[] = [];
  private listeners: Array<() => void> = [];
  private lastPersistenceClassification: PersistenceClassification = 'DEMO_LOCAL_FALLBACK';

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

  public getLastPersistenceClassification(): PersistenceClassification {
    return this.lastPersistenceClassification;
  }

  private loadLocal(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.reports = parsed;
            return;
          }
        }
      }
    } catch {
      // Fallback to memory on storage error
    }
    this.reports = JSON.parse(JSON.stringify(INITIAL_SEEDED_REPORTS));
    this.saveLocal();
  }

  private saveLocal(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reports));
      }
    } catch {
      // Ignore local write errors
    }
  }

  /**
   * Helper to determine if a Member holds Coordinator capacity
   */
  public isCoordinator(member?: Member | null): boolean {
    if (!member) return false;
    return (
      member.roles.includes(MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR) ||
      member.roles.some((r) => String(r).includes('COORDINATOR')) ||
      member.id.includes('coord')
    );
  }

  /**
   * Synchronous getter for all reports (backward compatibility)
   */
  public getReports(): SharedMissingPuzzleReport[] {
    return [...this.reports];
  }

  /**
   * Synchronous getter by ID (backward compatibility)
   */
  public getReportById(id: string): SharedMissingPuzzleReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  /**
   * Backward-compatible synchronous saveReport (marks as DEMO_LOCAL_FALLBACK)
   */
  public saveReport(
    reportInput: Omit<SharedMissingPuzzleReport, 'id' | 'timestamp' | 'status' | 'events' | 'createdAt' | 'updatedAt' | 'persistenceClassification' | 'reporterMemberId' | 'reporterDisplayName' | 'pageContext' | 'involvementPreference'> & {
      reporterMemberId?: string;
      reporterDisplayName?: string;
      pageContext?: string;
      involvementPreference?: MissingPuzzleInvolvement;
    }
  ): SharedMissingPuzzleReport {
    const id = `puz-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const reporterMemberId = reportInput.reporterMemberId || reportInput.loggedBy?.id || 'anonymous';
    const reporterDisplayName = reportInput.reporterDisplayName || reportInput.loggedBy?.displayName || 'Fellow';
    const involvement = (reportInput.involvementPreference || reportInput.involvement || 'JUST_LOG') as MissingPuzzleInvolvement;

    const initialEvent: FeedbackEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      feedbackId: id,
      actorMemberId: reporterMemberId,
      actorDisplayName: reporterDisplayName,
      eventType: 'FEEDBACK_CREATED',
      timestamp: now,
      message: `Report created with preference: ${involvement}.`,
    };

    const newReport: SharedMissingPuzzleReport = {
      id,
      title: reportInput.title,
      description: reportInput.description,
      category: reportInput.category,
      locationContext: reportInput.locationContext || reportInput.pageContext || 'Missing Puzzle Modal',
      pageContext: reportInput.pageContext || reportInput.locationContext || 'General Application',
      routeContext: reportInput.routeContext,
      reporterMemberId,
      reporterDisplayName,
      reporterEmail: reportInput.reporterEmail || reportInput.loggedBy?.email,
      createdAt: now,
      updatedAt: now,
      puzzleCompleted: !!reportInput.puzzleCompleted,
      involvementPreference: involvement,
      status: 'PENDING_REVIEW',
      events: [initialEvent],
      persistenceClassification: 'DEMO_LOCAL_FALLBACK',
      loggedBy: reportInput.loggedBy || {
        id: reporterMemberId,
        displayName: reporterDisplayName,
        h4dMemberId: (reportInput as any).h4dMemberId || 'H4D-00000',
        email: reportInput.reporterEmail,
      },
      timestamp: now,
      involvement,
    };

    this.reports.unshift(newReport);
    this.saveLocal();
    this.notify();
    return newReport;
  }

  /**
   * 1. CREATE FEEDBACK (Shared Operational Store)
   *
   * Invariants:
   * - Anonymous members cannot create feedback
   * - Members cannot impersonate another reporter (actorMember.id must equal data.reporterMemberId)
   * - Appends initial FEEDBACK_CREATED event
   * - Honors honest persistence reporting (SHARED_OPERATIONAL_PERSISTENCE vs DEMO_LOCAL_FALLBACK)
   */
  public async createFeedback(
    data: CreateFeedbackInput,
    actorMember?: Member | null
  ): Promise<{ report: SharedMissingPuzzleReport; persistence: PersistenceClassification }> {
    if (!actorMember) {
      throw new Error('Authentication required: Anonymous members cannot create feedback reports.');
    }

    if (data.reporterMemberId && data.reporterMemberId !== actorMember.id) {
      throw new Error(
        `Impersonation forbidden: Actor member '${actorMember.id}' cannot submit report on behalf of '${data.reporterMemberId}'.`
      );
    }

    const id = `puz-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const involvement = data.involvementPreference || 'JUST_LOG';

    const createEvent: FeedbackEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      feedbackId: id,
      actorMemberId: actorMember.id,
      actorDisplayName: actorMember.displayName,
      eventType: 'FEEDBACK_CREATED',
      timestamp: now,
      message: `Feedback report logged via Missing Puzzle modal with involvement preference: ${involvement}.`,
    };

    let persistence: PersistenceClassification = 'DEMO_LOCAL_FALLBACK';

    // Attempt shared Firestore write
    try {
      const docRef = doc(db, 'puzzleFeedback', id);
      await setDoc(docRef, {
        id,
        reporterMemberId: actorMember.id,
        reporterDisplayName: actorMember.displayName,
        reporterEmail: actorMember.email || data.reporterEmail || '',
        createdAt: now,
        updatedAt: now,
        pageContext: data.pageContext || data.locationContext || 'General View',
        routeContext: data.routeContext || '',
        category: data.category,
        title: data.title,
        description: data.description,
        puzzleCompleted: !!data.puzzleCompleted,
        involvementPreference: involvement,
        status: 'PENDING_REVIEW',
        events: [createEvent],
      });

      // Write append-only event into subcollection
      const eventDocRef = doc(db, 'puzzleFeedback', id, 'events', createEvent.eventId);
      await setDoc(eventDocRef, createEvent).catch(() => {});

      persistence = 'SHARED_OPERATIONAL_PERSISTENCE';
    } catch {
      // Offline / Firestore unit test / permission fallback
      persistence = 'DEMO_LOCAL_FALLBACK';
    }

    const report: SharedMissingPuzzleReport = {
      id,
      reporterMemberId: actorMember.id,
      reporterDisplayName: actorMember.displayName,
      reporterEmail: actorMember.email || data.reporterEmail,
      createdAt: now,
      updatedAt: now,
      pageContext: data.pageContext || data.locationContext || 'General View',
      routeContext: data.routeContext,
      locationContext: data.locationContext || data.pageContext,
      category: data.category,
      title: data.title,
      description: data.description,
      puzzleCompleted: !!data.puzzleCompleted,
      involvementPreference: involvement,
      status: 'PENDING_REVIEW',
      events: [createEvent],
      persistenceClassification: persistence,
      loggedBy: {
        id: actorMember.id,
        displayName: actorMember.displayName,
        h4dMemberId: actorMember.h4dMemberId || 'H4D-FELLOW',
        email: actorMember.email,
      },
      timestamp: now,
      involvement,
    };

    this.lastPersistenceClassification = persistence;
    this.reports.unshift(report);
    this.saveLocal();
    this.notify();

    return { report, persistence };
  }

  /**
   * 2. GET FEEDBACK FOR MEMBER (Scoped to reporter or Coordinator)
   */
  public async getFeedbackForMember(
    targetMemberId: string,
    requester?: Member | null
  ): Promise<SharedMissingPuzzleReport[]> {
    if (!requester) {
      throw new Error('Authentication required to view member feedback.');
    }

    const isCoord = this.isCoordinator(requester);
    if (requester.id !== targetMemberId && !isCoord) {
      throw new Error(
        `Unauthorized: Member '${requester.id}' cannot inspect private reports for '${targetMemberId}'.`
      );
    }

    // Try reading from Firestore
    try {
      const snap = await getDocs(collection(db, 'puzzleFeedback'));
      if (!snap.empty) {
        const firestoreReports: SharedMissingPuzzleReport[] = [];
        snap.forEach((d) => {
          const raw = d.data() as any;
          if (raw.reporterMemberId === targetMemberId) {
            firestoreReports.push({
              ...raw,
              persistenceClassification: 'SHARED_OPERATIONAL_PERSISTENCE',
              loggedBy: raw.loggedBy || {
                id: raw.reporterMemberId,
                displayName: raw.reporterDisplayName,
                h4dMemberId: 'H4D-MEMBER',
                email: raw.reporterEmail,
              },
              timestamp: raw.createdAt,
              involvement: raw.involvementPreference,
            });
          }
        });
        if (firestoreReports.length > 0) {
          return firestoreReports;
        }
      }
    } catch {
      // Fallback to local
    }

    return this.reports.filter((r) => r.reporterMemberId === targetMemberId);
  }

  /**
   * 3. GET TRIAGE FEEDBACK (Scoped to Coordinator)
   */
  public async getTriageFeedback(coordinator?: Member | null): Promise<SharedMissingPuzzleReport[]> {
    if (!coordinator) {
      throw new Error('Authentication required for community triage.');
    }

    if (!this.isCoordinator(coordinator)) {
      throw new Error(
        `Authorization denied: Member '${coordinator.id}' does not hold Coordinator triage authority.`
      );
    }

    try {
      const snap = await getDocs(collection(db, 'puzzleFeedback'));
      if (!snap.empty) {
        const firestoreReports: SharedMissingPuzzleReport[] = [];
        snap.forEach((d) => {
          const raw = d.data() as any;
          firestoreReports.push({
            ...raw,
            persistenceClassification: 'SHARED_OPERATIONAL_PERSISTENCE',
            loggedBy: raw.loggedBy || {
              id: raw.reporterMemberId,
              displayName: raw.reporterDisplayName,
              h4dMemberId: 'H4D-MEMBER',
              email: raw.reporterEmail,
            },
            timestamp: raw.createdAt,
            involvement: raw.involvementPreference,
          });
        });
        if (firestoreReports.length > 0) {
          return firestoreReports;
        }
      }
    } catch {
      // Fallback to local
    }

    return [...this.reports];
  }

  /**
   * 4. ACKNOWLEDGE FEEDBACK (Coordinator action)
   */
  public async acknowledgeFeedback(
    feedbackId: string,
    actor: Member,
    note?: string
  ): Promise<SharedMissingPuzzleReport> {
    if (!this.isCoordinator(actor)) {
      throw new Error('Authorization denied: Only the Coordinator can acknowledge feedback.');
    }

    const report = this.reports.find((r) => r.id === feedbackId);
    if (!report) {
      throw new Error(`Feedback report not found: ${feedbackId}`);
    }

    const now = new Date().toISOString();
    const event: FeedbackEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      feedbackId,
      actorMemberId: actor.id,
      actorDisplayName: actor.displayName,
      actorCapacity: 'L2E Accommodation Fellows Coordinator',
      eventType: 'FEEDBACK_ACKNOWLEDGED',
      timestamp: now,
      message: note || 'Report acknowledged by Accommodation Fellows Coordinator.',
    };

    report.status = 'UNDER_REVIEW';
    report.updatedAt = now;
    report.events.push(event);

    try {
      await updateDoc(doc(db, 'puzzleFeedback', feedbackId), {
        status: 'UNDER_REVIEW',
        updatedAt: now,
        events: report.events,
      });
      await setDoc(doc(db, 'puzzleFeedback', feedbackId, 'events', event.eventId), event).catch(() => {});
    } catch {
      // Local fallback preserved
    }

    this.saveLocal();
    this.notify();

    // Invariant: notify reporter of acknowledgment
    notificationStore.addNotification({
      memberId: report.reporterMemberId,
      title: 'Missing Puzzle Acknowledged',
      message: `Your report "${report.title}" was acknowledged by ${actor.displayName}.${note ? ` Note: ${note}` : ''}`,
      feedbackId: report.id,
      type: 'FEEDBACK_ACKNOWLEDGED',
    });

    return report;
  }

  /**
   * 5. REQUEST CLARIFICATION (Coordinator action)
   */
  public async requestClarification(
    feedbackId: string,
    actor: Member,
    questionOrCapacity: string,
    optionalQuestion?: string
  ): Promise<SharedMissingPuzzleReport> {
    if (!this.isCoordinator(actor)) {
      throw new Error('Authorization denied: Only the Coordinator can request clarification.');
    }

    const question = optionalQuestion !== undefined ? optionalQuestion : questionOrCapacity;
    const actorCapacity = optionalQuestion !== undefined ? questionOrCapacity : undefined;

    if (!question || question.trim().length === 0) {
      throw new Error('Clarification question cannot be empty.');
    }

    const report = this.reports.find((r) => r.id === feedbackId);
    if (!report) {
      throw new Error(`Feedback report not found: ${feedbackId}`);
    }

    const now = new Date().toISOString();
    const event: FeedbackEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      feedbackId,
      actorMemberId: actor.id,
      actorDisplayName: actor.displayName,
      actorCapacity,
      eventType: 'CLARIFICATION_REQUESTED',
      timestamp: now,
      message: question.trim(),
    };

    report.status = 'IN_PROGRESS';
    report.updatedAt = now;
    report.events.push(event);

    try {
      await updateDoc(doc(db, 'puzzleFeedback', feedbackId), {
        status: 'IN_PROGRESS',
        updatedAt: now,
        events: report.events,
      });
      await setDoc(doc(db, 'puzzleFeedback', feedbackId, 'events', event.eventId), event).catch(() => {});
    } catch {
      // Local fallback preserved
    }

    this.saveLocal();
    this.notify();

    // Invariant: notify reporter of clarification request
    notificationStore.addNotification({
      memberId: report.reporterMemberId,
      title: 'Clarification Requested on Missing Puzzle',
      message: `${actor.displayName} requested clarification on "${report.title}": "${question.trim()}"`,
      feedbackId: report.id,
      type: 'CLARIFICATION_REQUESTED',
    });

    return report;
  }

  /**
   * 6. REPORTER REPLY (Reporter action)
   */
  public async replyToClarification(
    feedbackId: string,
    reporter: Member,
    replyMessage: string
  ): Promise<SharedMissingPuzzleReport> {
    if (!replyMessage || replyMessage.trim().length === 0) {
      throw new Error('Reply message cannot be empty.');
    }

    const report = this.reports.find((r) => r.id === feedbackId);
    if (!report) {
      throw new Error(`Feedback report not found: ${feedbackId}`);
    }

    if (report.reporterMemberId !== reporter.id && !this.isCoordinator(reporter)) {
      throw new Error('Authorization denied: Only the reporter can reply to this report.');
    }

    const now = new Date().toISOString();
    const event: FeedbackEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      feedbackId,
      actorMemberId: reporter.id,
      actorDisplayName: reporter.displayName,
      eventType: 'MEMBER_REPLIED',
      timestamp: now,
      message: replyMessage.trim(),
    };

    report.updatedAt = now;
    report.events.push(event);

    try {
      await updateDoc(doc(db, 'puzzleFeedback', feedbackId), {
        updatedAt: now,
        events: report.events,
      });
      await setDoc(doc(db, 'puzzleFeedback', feedbackId, 'events', event.eventId), event).catch(() => {});
    } catch {
      // Local fallback preserved
    }

    this.saveLocal();
    this.notify();
    return report;
  }

  /**
   * 7. UPDATE STATUS (Coordinator action)
   */
  public async updateStatus(
    feedbackId: string,
    actor: Member,
    newStatus: FeedbackStatus,
    note?: string
  ): Promise<SharedMissingPuzzleReport> {
    if (!this.isCoordinator(actor)) {
      throw new Error('Authorization denied: Only the Coordinator can update report status.');
    }

    const report = this.reports.find((r) => r.id === feedbackId);
    if (!report) {
      throw new Error(`Feedback report not found: ${feedbackId}`);
    }

    const now = new Date().toISOString();
    let eventType: FeedbackEventType = 'STATUS_CHANGED';
    if (newStatus === 'IMPLEMENTED' || newStatus === 'RESOLVED') eventType = 'RESOLVED';
    if (newStatus === 'CLOSED') eventType = 'CLOSED';

    const event: FeedbackEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      feedbackId,
      actorMemberId: actor.id,
      actorDisplayName: actor.displayName,
      eventType,
      timestamp: now,
      message: note || `Status transitioned to ${newStatus}.`,
    };

    report.status = newStatus;
    report.updatedAt = now;
    report.events.push(event);

    try {
      await updateDoc(doc(db, 'puzzleFeedback', feedbackId), {
        status: newStatus,
        updatedAt: now,
        events: report.events,
      });
      await setDoc(doc(db, 'puzzleFeedback', feedbackId, 'events', event.eventId), event).catch(() => {});
    } catch {
      // Local fallback preserved
    }

    this.saveLocal();
    this.notify();

    // Invariant: notify reporter on status change / resolution
    notificationStore.addNotification({
      memberId: report.reporterMemberId,
      title: (newStatus === 'IMPLEMENTED' || newStatus === 'RESOLVED') ? 'Missing Puzzle Resolved' : `Puzzle Status: ${newStatus}`,
      message: `Your report "${report.title}" is now ${newStatus}.${note ? ` ${note}` : ''}`,
      feedbackId: report.id,
      type: (newStatus === 'IMPLEMENTED' || newStatus === 'RESOLVED') ? 'RESOLVED' : 'STATUS_CHANGED',
    });

    return report;
  }

  /**
   * Helper to resolve feedback report
   */
  public async resolveFeedback(
    feedbackId: string,
    actor: Member,
    note?: string
  ): Promise<SharedMissingPuzzleReport> {
    return this.updateStatus(feedbackId, actor, 'IMPLEMENTED', note);
  }

  /**
   * 8. UPDATE INVOLVEMENT PREFERENCE (Reporter action)
   */
  public async updateInvolvementForMember(
    feedbackId: string,
    actor: Member,
    involvement: MissingPuzzleInvolvement
  ): Promise<SharedMissingPuzzleReport> {
    const report = this.reports.find((r) => r.id === feedbackId);
    if (!report) {
      throw new Error(`Feedback report not found: ${feedbackId}`);
    }

    if (report.reporterMemberId !== actor.id && !this.isCoordinator(actor)) {
      throw new Error('Authorization denied: Only the reporter can update involvement preference.');
    }

    const now = new Date().toISOString();
    let eventType: FeedbackEventType = 'STATUS_CHANGED';
    if (involvement === 'HELP_TEST') eventType = 'TESTING_VOLUNTEERED';
    else if (involvement === 'CONTRIBUTE_FIX') eventType = 'CONTRIBUTION_VOLUNTEERED';

    const event: FeedbackEvent = {
      eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      feedbackId,
      actorMemberId: actor.id,
      actorDisplayName: actor.displayName,
      eventType,
      timestamp: now,
      message: `Involvement preference updated to: ${involvement}.`,
    };

    report.involvementPreference = involvement;
    report.involvement = involvement;
    report.updatedAt = now;
    report.events.push(event);

    try {
      await updateDoc(doc(db, 'puzzleFeedback', feedbackId), {
        involvementPreference: involvement,
        updatedAt: now,
        events: report.events,
      });
      await setDoc(doc(db, 'puzzleFeedback', feedbackId, 'events', event.eventId), event).catch(() => {});
    } catch {
      // Local fallback preserved
    }

    this.saveLocal();
    this.notify();
    return report;
  }

  /**
   * Synchronous updateInvolvement helper (backward compatibility)
   */
  public updateInvolvement(
    reportId: string,
    involvement: MissingPuzzleInvolvement
  ): SharedMissingPuzzleReport | null {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) {
      report.involvement = involvement;
      report.involvementPreference = involvement;
      report.updatedAt = new Date().toISOString();
      this.saveLocal();
      this.notify();
      return report;
    }
    return null;
  }

  /**
   * Reset store to initial state (for testing)
   */
  public resetToInitial(): void {
    this.reports = JSON.parse(JSON.stringify(INITIAL_SEEDED_REPORTS));
    this.saveLocal();
    this.notify();
  }
}

export const puzzleFeedbackStore = new PuzzleFeedbackStore();
