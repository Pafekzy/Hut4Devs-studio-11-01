import React, { useState, useEffect } from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, formatActionAttribution } from '../domain/membership';
import { GovernancePreviewContext } from './Hut4DevsFrame';
import {
  WelfareCase,
  WelfareCategory,
  WelfareCasePriority,
} from '../domain/welfareMediation';
import { FeedbackStatus } from '../domain/puzzleFeedback';
import { welfareMediationStore } from '../services/welfareMediationStore';
import {
  HeartHandshake,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Building,
  Home,
  Users,
  Search,
  Plus,
  Send,
  ArrowRight,
  Sparkles,
  ChevronRight,
  X,
  FileText,
  Wrench,
  Volume2,
  Wind,
  Smile,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface WelfareMediationWorkspaceViewProps {
  member: Member;
  activeMode: ActiveMode;
  isDark?: boolean;
  previewContext?: GovernancePreviewContext | null;
}

type WelfareFilter = 'ALL' | 'PENDING_REVIEW' | 'IN_PROGRESS' | 'FACILITY_ESCALATED' | 'IMPLEMENTED';

export const WelfareMediationWorkspaceView: React.FC<WelfareMediationWorkspaceViewProps> = ({
  member,
  activeMode,
  isDark = false,
  previewContext,
}) => {
  const [cases, setCases] = useState<WelfareCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<WelfareCase | null>(null);
  const [activeFilter, setActiveFilter] = useState<WelfareFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive action states
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);

  // Form states
  const [newNoteText, setNewNoteText] = useState('');
  const [acknowledgeNote, setAcknowledgeNote] = useState('');
  const [agreementSummary, setAgreementSummary] = useState('');
  const [agreementItems, setAgreementItems] = useState('');
  const [agreementReviewDate, setAgreementReviewDate] = useState('');

  const [escalationTarget, setEscalationTarget] = useState('Infinite Grace Facility Management (Engr. Taiwo)');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationTargetDate, setEscalationTargetDate] = useState('');

  // New Case form state
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseCategory, setNewCaseCategory] = useState<WelfareCategory>('LIVING_CONDITIONS');
  const [newCasePriority, setNewCasePriority] = useState<WelfareCasePriority>('NORMAL');
  const [newCaseProperty, setNewCaseProperty] = useState('Infinite Grace Apartment');
  const [newCaseFloor, setNewCaseFloor] = useState('Floor 3');
  const [newCaseRoom, setNewCaseRoom] = useState('Room 304');
  const [newCaseResidents, setNewCaseResidents] = useState('');

  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  const loadData = () => {
    const all = welfareMediationStore.getCases();
    setCases(all);
    if (selectedCase) {
      const updated = all.find((c) => c.id === selectedCase.id);
      if (updated) setSelectedCase(updated);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = welfareMediationStore.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, [selectedCase?.id]);

  const attribution = formatActionAttribution(member, activeMode);

  // Filter calculations
  const pendingCount = cases.filter((c) => c.status === 'PENDING_REVIEW').length;
  const inProgressCount = cases.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'UNDER_REVIEW').length;
  const facilityCount = cases.filter((c) => c.escalatedToFacility).length;
  const implementedCount = cases.filter((c) => c.status === 'IMPLEMENTED').length;

  const filteredCases = cases.filter((c) => {
    // 1. Filter tab
    if (activeFilter === 'PENDING_REVIEW' && c.status !== 'PENDING_REVIEW') return false;
    if (activeFilter === 'IN_PROGRESS' && c.status !== 'IN_PROGRESS' && c.status !== 'UNDER_REVIEW') return false;
    if (activeFilter === 'FACILITY_ESCALATED' && !c.escalatedToFacility) return false;
    if (activeFilter === 'IMPLEMENTED' && c.status !== 'IMPLEMENTED') return false;

    // 2. Category
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;

    // 3. Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchRoom = c.roomName.toLowerCase().includes(q) || c.propertyName.toLowerCase().includes(q);
      const matchReporter = c.reporterDisplayName.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      if (!matchTitle && !matchRoom && !matchReporter && !matchDesc) return false;
    }

    return true;
  });

  const getCategoryIcon = (category: WelfareCategory) => {
    switch (category) {
      case 'LIVING_CONDITIONS':
        return <Wind className="w-4 h-4 text-[#C88D3A]" />;
      case 'INTERPERSONAL_CONFLICT':
        return <HeartHandshake className="w-4 h-4 text-[#C88D3A]" />;
      case 'FACILITY_ESCALATION':
        return <Wrench className="w-4 h-4 text-[#B77620]" />;
      case 'WELLBEING_SUPPORT':
        return <Smile className="w-4 h-4 text-[#2E7D32]" />;
      case 'NOISE_AND_ENVIRONMENT':
        return <Volume2 className="w-4 h-4 text-[#C88D3A]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#C88D3A]" />;
    }
  };

  const getCategoryLabel = (category: WelfareCategory) => {
    switch (category) {
      case 'LIVING_CONDITIONS':
        return 'Living Conditions';
      case 'INTERPERSONAL_CONFLICT':
        return 'Roommate Mediation';
      case 'FACILITY_ESCALATION':
        return 'Facility Escalation';
      case 'WELLBEING_SUPPORT':
        return 'Wellbeing Support';
      case 'NOISE_AND_ENVIRONMENT':
        return 'Noise & Environment';
      default:
        return category;
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <HeartHandshake className="w-3.5 h-3.5" />
            Mediation Active
          </span>
        );
      case 'IMPLEMENTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Restorative Resolution
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300">
            {status}
          </span>
        );
    }
  };

  // Handlers
  const handleAcknowledge = (caseItem: WelfareCase) => {
    try {
      welfareMediationStore.acknowledgeCase(caseItem.id, member, acknowledgeNote);
      setAcknowledgeNote('');
      setActionSuccessMsg(`Case ${caseItem.caseNumber} acknowledged and marked Under Review.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to acknowledge case');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  const handleAddNote = () => {
    if (!selectedCase || !newNoteText.trim()) return;
    try {
      welfareMediationStore.addRestorativeNote({
        caseId: selectedCase.id,
        authorMemberId: member.id,
        authorDisplayName: member.displayName,
        authorCapacity: 'Accommodation Welfare & Mediation Officer',
        content: newNoteText.trim(),
      });
      setNewNoteText('');
      setActionSuccessMsg('Restorative note recorded in append-only event trail.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to add note');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  const handleRecordAgreement = () => {
    if (!selectedCase || !agreementSummary.trim()) return;
    try {
      const items = agreementItems
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      welfareMediationStore.recordMediationAgreement(
        selectedCase.id,
        member,
        agreementSummary.trim(),
        items.length > 0 ? items : ['Quiet hours observed', 'Weekly mutual check-in'],
        agreementReviewDate || undefined
      );

      setShowAgreementModal(false);
      setAgreementSummary('');
      setAgreementItems('');
      setAgreementReviewDate('');
      setActionSuccessMsg('Restorative mediation agreement recorded and shared with participants.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to record agreement');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  const handleEscalateToFacility = () => {
    if (!selectedCase || !escalationReason.trim()) return;
    try {
      welfareMediationStore.escalateToFacility({
        caseId: selectedCase.id,
        actorMemberId: member.id,
        actorDisplayName: member.displayName,
        actorCapacity: 'Accommodation Welfare & Mediation Officer',
        targetRecipient: escalationTarget,
        reason: escalationReason.trim(),
        targetResolutionDate: escalationTargetDate || undefined,
      });

      setShowEscalationModal(false);
      setEscalationReason('');
      setEscalationTargetDate('');
      setActionSuccessMsg(`Formal facility escalation ticket dispatched to ${escalationTarget}.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to escalate to facility');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  const handleAdvanceStatus = (newStatus: FeedbackStatus, defaultNote: string) => {
    if (!selectedCase) return;
    try {
      welfareMediationStore.advanceStatus({
        caseId: selectedCase.id,
        actorMemberId: member.id,
        actorDisplayName: member.displayName,
        actorCapacity: 'Accommodation Welfare & Mediation Officer',
        newStatus,
        note: defaultNote,
      });
      setActionSuccessMsg(`Status advanced to ${newStatus}. Resident informed via notifications.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to update status');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  const handleCreateNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim() || !newCaseDesc.trim()) return;

    try {
      const residents = newCaseResidents
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      welfareMediationStore.createCase(
        {
          title: newCaseTitle.trim(),
          description: newCaseDesc.trim(),
          category: newCaseCategory,
          priority: newCasePriority,
          propertyId: newCaseProperty.toLowerCase().replace(/\s+/g, '-'),
          propertyName: newCaseProperty,
          floorName: newCaseFloor,
          roomName: newCaseRoom,
          affectedResidents: residents,
          reporterDisplayName: member.displayName,
          reporterEmail: member.email,
          involvementPreference: 'CONTACT_ME',
        },
        member
      );

      setShowLogModal(false);
      setNewCaseTitle('');
      setNewCaseDesc('');
      setNewCaseResidents('');
      setActionSuccessMsg('New accommodation welfare concern logged successfully.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to create case');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  return (
    <div id="welfare-mediation-workspace" className="space-y-6">
      {/* Toast Feedback */}
      {actionSuccessMsg && (
        <div
          role="status"
          className="p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 bg-rose-50 text-rose-900 border border-rose-300 shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionErrorMsg('')}
            className="text-rose-700 hover:text-rose-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Scoped Governance & Role Boundary Banner */}
      <div
        id="welfare-governance-boundary-card"
        className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
          isDark
            ? 'bg-[#3D1E08]/70 border-[#5A2D0C] text-[#FFF9EE]'
            : 'bg-[#FFF9EE] border-[#C88D3A]/30 text-[#5A2D0C]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#5A2D0C] text-[#FFF9EE]">
                <HeartHandshake className="w-3.5 h-3.5 text-[#C88D3A]" />
                Welfare &amp; Mediation
              </span>
              <span className="text-xs text-[#8A5A36] font-medium">
                Learn2Earn · Lagos Yaba Accommodation
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#C88D3A]/20 text-[#5A2D0C] border border-[#C88D3A]/40">
                <Sparkles className="w-2.5 h-2.5 text-[#B77620]" />
                Demo Seed Fixture · Local Fallback
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#5A2D0C] dark:text-[#FFF9EE] tracking-tight">
              Accommodation Welfare &amp; Mediation Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#8A5A36] dark:text-[#EAD6C0] max-w-3xl leading-relaxed">
              Assigned to <strong>{attribution.actorName}</strong>. Scoped authority for resident wellbeing,
              living conditions, interpersonal roommate mediation, and facility maintenance escalations.
            </p>
          </div>

          <button
            type="button"
            id="log-welfare-concern-btn"
            onClick={() => setShowLogModal(true)}
            className="self-start lg:self-center px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C88D3A]" />
            <span>Log Welfare Concern</span>
          </button>
        </div>

        {/* Explicit Role Authority Boundary Disclosure */}
        <div className="mt-4 pt-4 border-t border-[#C88D3A]/20 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F7F1E7]/80 dark:bg-[#2F1707]/60 border border-[#C88D3A]/20 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#2E7D32]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Assigned Welfare &amp; Mediation Authority</span>
            </div>
            <p className="text-[11px] text-[#5A2D0C] dark:text-[#EAD6C0] leading-relaxed">
              Review living quality issues, convene roommate restorative sessions, record mediation agreements,
              track action items, and escalate physical building defects to property management.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F7F1E7]/80 dark:bg-[#2F1707]/60 border border-[#C88D3A]/20 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#8A5A36]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Strict Role Boundaries</span>
            </div>
            <p className="text-[11px] text-[#5A2D0C] dark:text-[#EAD6C0] leading-relaxed">
              Does NOT approve accommodation memberships (retained by Coordinator). Does NOT access raw payment
              ledgers or reconciliation queues (retained by Financial Admin).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Attention-First Case Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#FFF9EE] border-[#C88D3A] ring-2 ring-[#C88D3A]/40 shadow-xs'
              : 'bg-[#FFF9EE]/70 border-[#C88D3A]/20 hover:border-[#C88D3A]/60'
          }`}
        >
          <span className="text-[11px] font-medium text-[#8A5A36] uppercase tracking-wider block">Total Concerns</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#5A2D0C]">{cases.length}</span>
            <span className="text-xs text-[#8A5A36]">Across spaces</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('PENDING_REVIEW')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'PENDING_REVIEW'
              ? 'bg-[#FFF9EE] border-[#C88D3A] ring-2 ring-[#C88D3A]/40 shadow-xs'
              : 'bg-[#FFF9EE]/70 border-[#C88D3A]/20 hover:border-[#C88D3A]/60'
          }`}
        >
          <span className="text-[11px] font-medium text-[#B77620] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Needs Attention
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#B77620]">{pendingCount}</span>
            <span className="text-xs text-[#8A5A36]">Pending review</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('IN_PROGRESS')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'IN_PROGRESS'
              ? 'bg-[#FFF9EE] border-[#C88D3A] ring-2 ring-[#C88D3A]/40 shadow-xs'
              : 'bg-[#FFF9EE]/70 border-[#C88D3A]/20 hover:border-[#C88D3A]/60'
          }`}
        >
          <span className="text-[11px] font-medium text-[#5A2D0C] uppercase tracking-wider flex items-center gap-1">
            <HeartHandshake className="w-3 h-3 text-[#C88D3A]" />
            Active Mediation
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#5A2D0C]">{inProgressCount}</span>
            <span className="text-xs text-[#8A5A36]">Restorative path</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('FACILITY_ESCALATED')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'FACILITY_ESCALATED'
              ? 'bg-[#FFF9EE] border-[#C88D3A] ring-2 ring-[#C88D3A]/40 shadow-xs'
              : 'bg-[#FFF9EE]/70 border-[#C88D3A]/20 hover:border-[#C88D3A]/60'
          }`}
        >
          <span className="text-[11px] font-medium text-[#5A2D0C] uppercase tracking-wider flex items-center gap-1">
            <Wrench className="w-3 h-3 text-[#B77620]" />
            Facility Escalations
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#5A2D0C]">{facilityCount}</span>
            <span className="text-xs text-[#8A5A36]">Building issues</span>
          </div>
        </button>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#FFF9EE] border border-[#C88D3A]/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category select */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#8A5A36] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#C88D3A]" />
            Category:
          </span>
          <select
            id="welfare-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] font-medium focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
          >
            <option value="ALL">All Categories ({cases.length})</option>
            <option value="LIVING_CONDITIONS">Living Conditions (Ventilation/Sanitation)</option>
            <option value="INTERPERSONAL_CONFLICT">Roommate Mediation</option>
            <option value="FACILITY_ESCALATION">Facility Escalations</option>
            <option value="WELLBEING_SUPPORT">Wellbeing Support</option>
            <option value="NOISE_AND_ENVIRONMENT">Noise &amp; Environment</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A5A36]" />
          <input
            type="text"
            id="welfare-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by room, resident, keyword..."
            className="w-full text-xs py-1.5 pl-8 pr-3 rounded-lg border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] placeholder-[#8A5A36]/60 focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A5A36] hover:text-[#5A2D0C]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Case Cards List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#FFF9EE] border border-[#C88D3A]/20 space-y-2">
            <HeartHandshake className="w-8 h-8 text-[#C88D3A] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-[#5A2D0C] font-serif">No Welfare Concerns Found</h3>
            <p className="text-xs text-[#8A5A36]">
              There are no concerns matching the active filter or search criteria.
            </p>
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              id={`welfare-case-${caseItem.id}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                selectedCase?.id === caseItem.id
                  ? 'bg-[#FFF9EE] border-[#C88D3A] ring-2 ring-[#C88D3A]/30 shadow-sm'
                  : 'bg-[#FFF9EE] border-[#C88D3A]/25 hover:border-[#C88D3A]/60 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  {/* Metadata line */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#5A2D0C] px-2 py-0.5 rounded-md bg-[#F7F1E7] border border-[#C88D3A]/30">
                      {caseItem.caseNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8A5A36] px-2 py-0.5 rounded-md bg-[#F7F1E7]">
                      {getCategoryIcon(caseItem.category)}
                      {getCategoryLabel(caseItem.category)}
                    </span>
                    {getStatusBadge(caseItem.status)}
                    {caseItem.escalatedToFacility && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B77620] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300">
                        <Wrench className="w-3 h-3" />
                        Facility Ticket Dispatched
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#5A2D0C] leading-snug">
                      {caseItem.title}
                    </h3>
                    <p className="text-xs text-[#8A5A36] mt-1 line-clamp-2 leading-relaxed">
                      {caseItem.description}
                    </p>
                  </div>

                  {/* Context Scope */}
                  <div className="flex items-center gap-4 text-xs text-[#8A5A36] pt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <strong>{caseItem.propertyName}</strong> ({caseItem.floorName} · {caseItem.roomName})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#C88D3A]" />
                      Reported by: <strong>{caseItem.reporterDisplayName}</strong>
                    </span>
                    {caseItem.affectedResidents && caseItem.affectedResidents.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        Residents involved: {caseItem.affectedResidents.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Mediation Summary Snippet if recorded */}
                  {caseItem.mediationAgreement && (
                    <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                        <HeartHandshake className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Restorative Agreement Active</span>
                      </div>
                      <p className="text-[11px] text-indigo-900">{caseItem.mediationAgreement.summary}</p>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="sm:self-center shrink-0 flex sm:flex-col gap-2">
                  <button
                    type="button"
                    id={`open-welfare-case-${caseItem.id}-btn`}
                    onClick={() => setSelectedCase(caseItem)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors cursor-pointer"
                  >
                    <span>Open Case</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {caseItem.status === 'PENDING_REVIEW' && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(caseItem)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#FFF9EE] text-[#5A2D0C] border border-[#C88D3A] hover:bg-[#F7F1E7] transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Selected Case Detail Modal / Panel */}
      {selectedCase && (
        <div
          id="welfare-case-detail-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#2F1707]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="w-full max-w-3xl my-8 p-6 sm:p-8 rounded-2xl bg-[#FFF9EE] text-[#5A2D0C] border border-[#C88D3A] shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#C88D3A]/20 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#5A2D0C] px-2.5 py-0.5 rounded-md bg-[#F7F1E7] border border-[#C88D3A]/30">
                    {selectedCase.caseNumber}
                  </span>
                  <span className="text-xs font-medium text-[#8A5A36] px-2 py-0.5 rounded-md bg-[#F7F1E7]">
                    {getCategoryLabel(selectedCase.category)}
                  </span>
                  {getStatusBadge(selectedCase.status)}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#5A2D0C]">
                  {selectedCase.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#8A5A36] flex-wrap">
                  <span>{selectedCase.propertyName} · {selectedCase.floorName} · {selectedCase.roomName}</span>
                  <span>·</span>
                  <span>Reported by {selectedCase.reporterDisplayName}</span>
                </div>
              </div>
              <button
                type="button"
                id="close-welfare-case-modal-btn"
                onClick={() => setSelectedCase(null)}
                className="p-1.5 rounded-lg text-[#8A5A36] hover:text-[#5A2D0C] hover:bg-[#F7F1E7] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Narrative & Context */}
            <div className="space-y-2 p-4 rounded-xl bg-[#F7F1E7] border border-[#C88D3A]/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5A36] block">
                Resident Narrative &amp; Living Context
              </span>
              <p className="text-xs text-[#5A2D0C] leading-relaxed whitespace-pre-wrap">
                {selectedCase.description}
              </p>
              {selectedCase.affectedResidents && selectedCase.affectedResidents.length > 0 && (
                <div className="pt-2 text-xs text-[#8A5A36]">
                  <strong>Affected Residents:</strong> {selectedCase.affectedResidents.join(', ')}
                </div>
              )}
            </div>

            {/* Restorative Mediation Agreement Section (if recorded) */}
            {selectedCase.mediationAgreement ? (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-indigo-700" />
                    Restorative Mediation Agreement
                  </span>
                  <span className="text-[11px] text-indigo-700">
                    Recorded {new Date(selectedCase.mediationAgreement.recordedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  {selectedCase.mediationAgreement.summary}
                </p>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                    Agreed Action Items:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-indigo-900 text-xs pl-1">
                    {selectedCase.mediationAgreement.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                {selectedCase.mediationAgreement.reviewDate && (
                  <div className="text-[11px] text-indigo-700 pt-1">
                    Next follow-up review scheduled for: <strong>{selectedCase.mediationAgreement.reviewDate}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-dashed border-[#C88D3A]/40 flex items-center justify-between gap-3 text-xs bg-[#F7F1E7]/50">
                <span className="text-[#8A5A36]">No structured roommate agreement recorded yet for this case.</span>
                <button
                  type="button"
                  onClick={() => setShowAgreementModal(true)}
                  className="px-3 py-1.5 rounded-lg font-bold text-xs bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors cursor-pointer"
                >
                  Record Mediation Agreement
                </button>
              </div>
            )}

            {/* Facility Escalation Section (if escalated) */}
            {selectedCase.escalatedToFacility && selectedCase.facilityEscalationDetails ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-700" />
                    Facility Management Escalation
                  </span>
                  <span className="text-[11px] text-amber-700">
                    Dispatched {new Date(selectedCase.facilityEscalationDetails.escalatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Recipient:</strong> {selectedCase.facilityEscalationDetails.targetRecipient}
                </p>
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Reason:</strong> {selectedCase.facilityEscalationDetails.reason}
                </p>
                {selectedCase.facilityEscalationDetails.targetResolutionDate && (
                  <p className="text-[11px] text-amber-800">
                    Target repair date: <strong>{selectedCase.facilityEscalationDetails.targetResolutionDate}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-dashed border-[#C88D3A]/40 flex items-center justify-between gap-3 text-xs bg-[#F7F1E7]/50">
                <span className="text-[#8A5A36]">Issue has not been escalated to property facility management.</span>
                <button
                  type="button"
                  onClick={() => setShowEscalationModal(true)}
                  className="px-3 py-1.5 rounded-lg font-bold text-xs bg-[#FFF9EE] text-[#5A2D0C] border border-[#C88D3A] hover:bg-[#F7F1E7] transition-colors cursor-pointer"
                >
                  Escalate to Facility
                </button>
              </div>
            )}

            {/* Restorative Notes Trail */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A5A36] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C88D3A]" />
                Restorative Notes &amp; Follow-Up Updates
              </h4>
              {selectedCase.restorativeNotes.length === 0 ? (
                <p className="text-xs text-[#8A5A36] italic p-3 rounded-lg bg-[#F7F1E7]">
                  No follow-up notes logged yet. Use the field below to document restorative steps.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedCase.restorativeNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-[#F7F1E7] border border-[#C88D3A]/20 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#8A5A36]">
                        <span className="font-semibold text-[#5A2D0C]">{note.authorName} ({note.authorCapacity})</span>
                        <span>{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[#5A2D0C] leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note Form */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  id="add-welfare-note-input"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add restorative observation, resident check-in, or follow-up note..."
                  className="flex-1 text-xs py-2 px-3 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <button
                  type="button"
                  id="submit-welfare-note-btn"
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </div>
            </div>

            {/* Audit Trail of Care (Append-Only Events) */}
            <div className="space-y-2 pt-2 border-t border-[#C88D3A]/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A5A36]">
                Append-Only Audit Trail of Care
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {selectedCase.events.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-2.5 rounded-lg bg-[#F7F1E7]/70 text-[11px] text-[#5A2D0C] flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#5A2D0C]">
                        {evt.actorDisplayName} <span className="text-[#8A5A36]">({evt.actorCapacity})</span>
                      </div>
                      <div className="text-[#8A5A36]">{evt.message}</div>
                    </div>
                    <span className="text-[10px] text-[#8A5A36] shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifecycle Status Progression Controls */}
            <div className="p-4 rounded-xl bg-[#F7F1E7] border border-[#C88D3A]/30 space-y-3">
              <span className="text-xs font-bold text-[#5A2D0C] block">
                Lifecycle Progression Controls
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCase.status === 'PENDING_REVIEW' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('UNDER_REVIEW', 'Acknowledged and moved to active review.')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] cursor-pointer"
                  >
                    Set Under Review
                  </button>
                )}

                {selectedCase.status !== 'IN_PROGRESS' && selectedCase.status !== 'IMPLEMENTED' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus('IN_PROGRESS', 'Mediation plan activated with resident cohort.')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-900 text-[#FFF9EE] hover:bg-indigo-950 cursor-pointer"
                  >
                    Activate Mediation Plan
                  </button>
                )}

                {selectedCase.status !== 'IMPLEMENTED' && (
                  <button
                    type="button"
                    id="mark-welfare-case-resolved-btn"
                    onClick={() => handleAdvanceStatus('IMPLEMENTED', 'Restorative resolution verified with residents.')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2E7D32] text-white hover:bg-emerald-800 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Restorative Resolution</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Record Mediation Agreement Modal */}
      {showAgreementModal && selectedCase && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#2F1707]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg my-8 p-6 rounded-2xl bg-[#FFF9EE] text-[#5A2D0C] border border-[#C88D3A] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#C88D3A]/20 pb-3">
              <h3 className="text-lg font-bold font-serif text-[#5A2D0C] flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#C88D3A]" />
                Record Restorative Mediation Agreement
              </h3>
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="text-[#8A5A36] hover:text-[#5A2D0C] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8A5A36] leading-relaxed">
              Record the mutually agreed guidelines between residents of{' '}
              <strong>{selectedCase.propertyName} ({selectedCase.roomName})</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Agreement Summary:
                </label>
                <input
                  type="text"
                  value={agreementSummary}
                  onChange={(e) => setAgreementSummary(e.target.value)}
                  placeholder="e.g. Quiet hours from 11:30 PM; use study lounge for late pairing"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Agreed Action Items (one per line):
                </label>
                <textarea
                  rows={3}
                  value={agreementItems}
                  onChange={(e) => setAgreementItems(e.target.value)}
                  placeholder="Late coding sprints move to lounge&#10;Headphones required after 10 PM&#10;Sunday room sync before sprint start"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Follow-up Review Date (optional):
                </label>
                <input
                  type="date"
                  value={agreementReviewDate}
                  onChange={(e) => setAgreementReviewDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C88D3A]/20">
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#8A5A36] hover:bg-[#F7F1E7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordAgreement}
                disabled={!agreementSummary.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] disabled:opacity-40 cursor-pointer"
              >
                Save Restorative Agreement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Escalate to Facility Modal */}
      {showEscalationModal && selectedCase && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#2F1707]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg my-8 p-6 rounded-2xl bg-[#FFF9EE] text-[#5A2D0C] border border-[#C88D3A] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#C88D3A]/20 pb-3">
              <h3 className="text-lg font-bold font-serif text-[#5A2D0C] flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#B77620]" />
                Escalate to Facility Stakeholder
              </h3>
              <button
                type="button"
                onClick={() => setShowEscalationModal(false)}
                className="text-[#8A5A36] hover:text-[#5A2D0C] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8A5A36] leading-relaxed">
              Surface infrastructure defects (plumbing, electrical, ventilation fixtures) to the property
              stakeholder for maintenance resolution.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Facility Target Recipient:
                </label>
                <input
                  type="text"
                  value={escalationTarget}
                  onChange={(e) => setEscalationTarget(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Defect Description &amp; Safety / Living Impact:
                </label>
                <textarea
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Specify pump failure, electrical breaker tripping, or window latch defect requiring replacement..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Requested Repair Window / Target Date:
                </label>
                <input
                  type="date"
                  value={escalationTargetDate}
                  onChange={(e) => setEscalationTargetDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C88D3A]/20">
              <button
                type="button"
                onClick={() => setShowEscalationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#8A5A36] hover:bg-[#F7F1E7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEscalateToFacility}
                disabled={!escalationReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#B77620] text-[#FFF9EE] hover:bg-[#8A5A36] disabled:opacity-40 cursor-pointer"
              >
                Dispatch Facility Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Log New Concern Modal */}
      {showLogModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#2F1707]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg my-8 p-6 rounded-2xl bg-[#FFF9EE] text-[#5A2D0C] border border-[#C88D3A] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#C88D3A]/20 pb-3">
              <h3 className="text-lg font-bold font-serif text-[#5A2D0C] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C88D3A]" />
                Log Accommodation Welfare Concern
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-[#8A5A36] hover:text-[#5A2D0C] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCase} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Concern Title:
                </label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. 2nd Floor common area lighting during night power transition"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                    Category:
                  </label>
                  <select
                    value={newCaseCategory}
                    onChange={(e) => setNewCaseCategory(e.target.value as WelfareCategory)}
                    className="w-full text-xs p-2 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                  >
                    <option value="LIVING_CONDITIONS">Living Conditions (Ventilation/Sanitation)</option>
                    <option value="INTERPERSONAL_CONFLICT">Roommate Dispute</option>
                    <option value="FACILITY_ESCALATION">Facility Escalation</option>
                    <option value="WELLBEING_SUPPORT">Wellbeing Support</option>
                    <option value="NOISE_AND_ENVIRONMENT">Noise &amp; Environment</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                    Priority:
                  </label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value as WelfareCasePriority)}
                    className="w-full text-xs p-2 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="MONITORING">Monitoring</option>
                    <option value="URGENT">Urgent Attention</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#5A2D0C] block mb-1">Property:</label>
                  <select
                    value={newCaseProperty}
                    onChange={(e) => setNewCaseProperty(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C]"
                  >
                    <option value="Infinite Grace Apartment">Infinite Grace</option>
                    <option value="BedRock Hostel">BedRock Hostel</option>
                    <option value="MainBase Apartments">MainBase</option>
                    <option value="Tangerine Hotel">Tangerine</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#5A2D0C] block mb-1">Floor:</label>
                  <input
                    type="text"
                    value={newCaseFloor}
                    onChange={(e) => setNewCaseFloor(e.target.value)}
                    placeholder="Floor 3"
                    className="w-full text-xs p-2 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#5A2D0C] block mb-1">Room / Space:</label>
                  <input
                    type="text"
                    value={newCaseRoom}
                    onChange={(e) => setNewCaseRoom(e.target.value)}
                    placeholder="Room 304"
                    className="w-full text-xs p-2 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Concern Details &amp; Observations:
                </label>
                <textarea
                  rows={3}
                  required
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  placeholder="Describe the physical condition, noise pattern, or interpersonal friction observed..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A2D0C] block mb-1">
                  Residents Involved (comma-separated):
                </label>
                <input
                  type="text"
                  value={newCaseResidents}
                  onChange={(e) => setNewCaseResidents(e.target.value)}
                  placeholder="e.g. Chinedu Okeke, Emmanuel Ukom"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C88D3A]/30 bg-[#F7F1E7] text-[#5A2D0C] focus:outline-none focus:ring-1 focus:ring-[#C88D3A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C88D3A]/20">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#8A5A36] hover:bg-[#F7F1E7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] cursor-pointer"
                >
                  Log Welfare Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
