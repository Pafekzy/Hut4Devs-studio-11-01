import { describe, it, expect, beforeEach } from 'vitest';
import { MemberRole, Member } from '../domain/auth';
import { ActiveMode, getAvailableModesForMember } from '../domain/membership';
import { welfareMediationStore } from '../services/welfareMediationStore';

describe('H4D-TASK-003: Accommodation Welfare & Mediation Role & Workspace Foundation', () => {
  const welfareOfficer: Member = {
    id: 'member-welfare-mediation-officer',
    displayName: 'Arc. Olumide Adeleke',
    email: 'mediation@hut4devs.local',
    roles: [MemberRole.FELLOW, MemberRole.WELFARE_MEDIATION_OFFICER],
    createdAt: '2026-03-01T08:00:00Z',
  };

  const coordinator: Member = {
    id: 'member-coordinator-current',
    displayName: 'Emmanuel Ukom',
    email: 'coordinator@hut4devs.local',
    roles: [MemberRole.FELLOW, MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR],
    createdAt: '2026-04-10T10:00:00Z',
  };

  beforeEach(() => {
    welfareMediationStore.resetToInitial();
  });

  it('1. Welfare & Mediation Officer gets dedicated active mode and does NOT inherit Coordinator modes', () => {
    const welfareModes = getAvailableModesForMember(welfareOfficer);
    expect(welfareModes).toEqual(['WELFARE_MEDIATION_OFFICER']);
    expect(welfareModes).not.toContain('COORDINATOR');
    expect(welfareModes).not.toContain('FINANCIAL_ADMIN');
    expect(welfareModes).not.toContain('FINANCIAL_COVERAGE');

    // In contrast, coordinator has distinct multi-mode capabilities
    const coordModes = getAvailableModesForMember(coordinator);
    expect(coordModes).toContain('COORDINATOR');
    expect(coordModes).not.toContain('WELFARE_MEDIATION_OFFICER');
  });

  it('2. Loads seeded accommodation welfare cases with deterministic Learn2Earn Lagos Yaba fixtures', () => {
    const cases = welfareMediationStore.getCases();
    expect(cases.length).toBeGreaterThanOrEqual(4);

    const livingCase = cases.find((c) => c.caseNumber === 'WEL-2026-001');
    expect(livingCase).toBeDefined();
    expect(livingCase?.propertyName).toBe('Infinite Grace Apartment');
    expect(livingCase?.category).toBe('LIVING_CONDITIONS');
    expect(livingCase?.status).toBe('UNDER_REVIEW');

    const interpersonalCase = cases.find((c) => c.caseNumber === 'WEL-2026-002');
    expect(interpersonalCase).toBeDefined();
    expect(interpersonalCase?.category).toBe('INTERPERSONAL_CONFLICT');
    expect(interpersonalCase?.mediationAgreement).toBeDefined();
    expect(interpersonalCase?.mediationAgreement?.actionItems.length).toBeGreaterThan(0);
  });

  it('3. Advances case through canonical lifecycle with append-only event trail', () => {
    const newCase = welfareMediationStore.createCase(
      {
        title: 'BedRock Room 102 Ceiling Fan Humming',
        description: 'Vibration noise during sleep hours.',
        category: 'LIVING_CONDITIONS',
        propertyId: 'prop-bedrock-hostel',
        propertyName: 'BedRock Hostel',
        floorName: 'Floor 1',
        roomName: 'Room 102',
        reporterDisplayName: 'Segun Adeleke',
      },
      welfareOfficer
    );

    expect(newCase.status).toBe('PENDING_REVIEW');
    expect(newCase.events.length).toBe(1);
    expect(newCase.events[0].eventType).toBe('CASE_LOGGED');

    // Acknowledge -> UNDER_REVIEW
    const acked = welfareMediationStore.acknowledgeCase(
      newCase.id,
      welfareOfficer,
      'Inspected fan regulator during morning check.'
    );
    expect(acked.status).toBe('UNDER_REVIEW');
    expect(acked.events.length).toBe(2);
    expect(acked.events[1].eventType).toBe('ACKNOWLEDGED');
    expect(acked.restorativeNotes.length).toBe(1);

    // Advance to IN_PROGRESS
    const inProg = welfareMediationStore.advanceStatus({
      caseId: newCase.id,
      actorMemberId: welfareOfficer.id,
      actorDisplayName: welfareOfficer.displayName,
      actorCapacity: 'Accommodation Welfare & Mediation Officer',
      newStatus: 'IN_PROGRESS',
      note: 'Replacement regulator ordered.',
    });
    expect(inProg.status).toBe('IN_PROGRESS');
    expect(inProg.events.length).toBe(3);

    // Resolve -> IMPLEMENTED
    const resolved = welfareMediationStore.advanceStatus({
      caseId: newCase.id,
      actorMemberId: welfareOfficer.id,
      actorDisplayName: welfareOfficer.displayName,
      actorCapacity: 'Accommodation Welfare & Mediation Officer',
      newStatus: 'IMPLEMENTED',
      note: 'Regulator installed and whisper quiet.',
    });
    expect(resolved.status).toBe('IMPLEMENTED');
    expect(resolved.events.length).toBe(4);
    expect(resolved.events[3].eventType).toBe('RESOLVED');
  });

  it('4. Records structured restorative roommate agreement with action items', () => {
    const cases = welfareMediationStore.getCases();
    const target = cases[0];

    const updated = welfareMediationStore.recordMediationAgreement(
      target.id,
      welfareOfficer,
      'Respectful noise boundaries established for evening study.',
      ['Wear headphones after 10 PM', 'Move calls to lounge'],
      '2026-09-30'
    );

    expect(updated.mediationAgreement).toBeDefined();
    expect(updated.mediationAgreement?.actionItems).toContain('Wear headphones after 10 PM');
    expect(updated.status).toBe('IN_PROGRESS');
    expect(updated.events.some((e) => e.eventType === 'MEDIATION_SCHEDULED')).toBe(true);
  });

  it('5. Dispatches facility escalation with recipient, reason, and target repair date', () => {
    const cases = welfareMediationStore.getCases();
    const target = cases[0];

    const escalated = welfareMediationStore.escalateToFacility({
      caseId: target.id,
      actorMemberId: welfareOfficer.id,
      actorDisplayName: welfareOfficer.displayName,
      actorCapacity: 'Accommodation Welfare & Mediation Officer',
      targetRecipient: 'Infinite Grace Maintenance (Engr. Taiwo)',
      reason: 'Window hinge broken and requires welding.',
      targetResolutionDate: '2026-09-18',
    });

    expect(escalated.escalatedToFacility).toBe(true);
    expect(escalated.facilityEscalationDetails?.targetRecipient).toBe(
      'Infinite Grace Maintenance (Engr. Taiwo)'
    );
    expect(escalated.events.some((e) => e.eventType === 'FACILITY_ESCALATED')).toBe(true);
  });
});
