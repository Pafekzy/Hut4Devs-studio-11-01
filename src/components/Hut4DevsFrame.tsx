import React from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, ScopedRoleAssignment } from '../domain/membership';
import { Hut4DevsLogo } from './Hut4DevsLogo';
import { ThemeToggle } from './ThemeToggle';
import { ModeSwitcher } from './ModeSwitcher';
import { ArrowLeft, Home, ChevronRight, Sparkles, LogOut } from 'lucide-react';

/**
 * GovernancePreviewContext:
 * Scoped context metadata passed when activating a Development Preview from Governance hierarchy.
 */
export interface GovernancePreviewContext {
  isDevPreview: boolean;
  institutionId?: string;
  institutionName?: string;
  campusId?: string;
  campusName?: string;
  category?: 'ROOM_CAPTAIN' | 'COORDINATOR' | 'ADMINISTRATION';
  categoryLabel?: string;
  accommodationSpaceName?: string;
  roomNumber?: string;
  floor?: string;
  roleTitle?: string;
  fixtureMemberName?: string;
  fixtureMemberEmail?: string;
  fixtureClassification?: 'SEED_FIXTURE' | 'DEMO_POPULATION' | 'LOCAL_PREVIEW';
  returnDrillLevel?: 'INSTITUTIONS' | 'CAMPUSES' | 'CATEGORIES' | 'ROOM_CAPTAINS' | 'COORDINATOR' | 'ADMINISTRATION';
}

/**
 * Hut4DevsHeaderProps:
 * Unified header contract across Hut4Devs Development Governance and all role workspaces.
 */
export interface Hut4DevsHeaderProps {
  isDark: boolean;
  title?: string;
  subtitle?: string;
  previewContext?: GovernancePreviewContext | null;
  currentMember?: Member | null;
  activeMode?: ActiveMode;
  scopedRoles?: ScopedRoleAssignment[];
  onModeChange?: (mode: ActiveMode) => void;
  onBack?: () => void;
  backLabel?: string;
  onHome?: () => void;
  homeLabel?: string;
  onExitToLanding?: () => void;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  rightActions?: React.ReactNode;
}

/**
 * Hut4DevsHeader:
 * Unified sticky navigation header adhering to the accepted Member UI grammar.
 * Features:
 * 1. Sticky positioning with frosted warm ivory/chocolate backdrop
 * 2. Unmistakable Development Preview banner when previewing fixtures
 * 3. Graceful governance breadcrumbs (Institution › Campus › Space › Room › Role)
 * 4. Back button (moves exactly one hierarchy level up)
 * 5. Home button (returns to Sign In / Development Entry)
 * 6. Brand logo & quick actions
 */
export const Hut4DevsHeader: React.FC<Hut4DevsHeaderProps> = ({
  isDark,
  title,
  subtitle,
  previewContext,
  currentMember,
  activeMode,
  scopedRoles = [],
  onModeChange,
  onBack,
  backLabel,
  onHome,
  homeLabel,
  onExitToLanding,
  onToggleTheme,
  onLogout,
  rightActions,
}) => {
  return (
    <div className="sticky top-0 z-40 w-full transition-colors duration-200">
      {/* 1. Development Preview Context Banner */}
      {previewContext?.isDevPreview && (
        <div
          id="dev-preview-banner"
          role="status"
          aria-label="Development Preview Environment"
          className={`w-full px-3 sm:px-6 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
            isDark
              ? 'bg-[#241104] text-[#EAD6C0] border-[#4A240A]'
              : 'bg-[#5A2D0C] text-[#FFF9EE] border-[#381B07]'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#C88D3A] text-[#2F1707] shadow-xs">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Development Preview
            </span>
            <span className="font-medium text-[11px]">
              Fixture:{' '}
              <strong className="text-white dark:text-[#FFF9EE]">
                {previewContext.fixtureMemberName || 'Test Persona'}
              </strong>
              {previewContext.roleTitle ? ` (${previewContext.roleTitle})` : ''}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/30">
              🌱 Seed Fixture · Non-Production
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {onBack && (
              <button
                type="button"
                id="preview-banner-back-btn"
                onClick={onBack}
                className="inline-flex items-center gap-1 font-semibold underline hover:text-[#C88D3A] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded px-1.5 py-0.5"
              >
                <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                <span>{backLabel || 'Return to Governance'}</span>
              </button>
            )}
            {onHome && (
              <button
                type="button"
                id="preview-banner-home-btn"
                onClick={onHome}
                className="inline-flex items-center gap-1 font-semibold underline hover:text-[#C88D3A] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded px-1.5 py-0.5"
              >
                <Home className="w-3 h-3" aria-hidden="true" />
                <span>Sign In / Dev Entry</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Sticky Navigation Bar */}
      <header
        id="hut4devs-sticky-header"
        className="w-full border-b transition-colors duration-200 shadow-xs"
        style={{
          borderColor: isDark ? '#3E200C' : '#EAE0D0',
          backgroundColor: isDark ? 'rgba(47, 23, 7, 0.96)' : 'rgba(247, 241, 231, 0.96)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand + Back + Home Navigation */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              id="header-brand-logo-btn"
              onClick={previewContext?.isDevPreview ? onHome : (onExitToLanding || onHome)}
              className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] rounded-lg cursor-pointer p-0.5"
              title={
                previewContext?.isDevPreview
                  ? 'Return to Sign In / Development Entry'
                  : 'Return to Public Landing'
              }
              aria-label="Hut4Devs Brand Logo"
            >
              <Hut4DevsLogo isDark={isDark} size="sm" showWordmark={true} />
            </button>

            {/* Back Button (one hierarchy level backward) */}
            {onBack && (
              <button
                type="button"
                id="header-nav-back-btn"
                onClick={onBack}
                aria-label={backLabel || 'Move one level back in governance hierarchy'}
                title={backLabel || 'Back (One hierarchy level)'}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-b-2 active:border-b active:translate-y-[1px] shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                  isDark
                    ? 'bg-[#3E200C] text-[#FFF9EE] border-[#52270A] hover:bg-[#52270A]'
                    : 'bg-[#FFF9EE] text-[#5A2D0C] border-[#D9C8B0] hover:bg-[#F2E8D8]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C88D3A]" aria-hidden="true" />
                <span className="hidden sm:inline">{backLabel || 'Back'}</span>
              </button>
            )}

            {/* Home Button (returns strictly to Sign In / Development Entry in dev mode) */}
            {onHome && (
              <button
                type="button"
                id="header-nav-home-btn"
                onClick={onHome}
                aria-label={homeLabel || 'Return to Sign In / Development Entry'}
                title={homeLabel || 'Sign In / Development Entry'}
                className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer border-b-2 active:border-b active:translate-y-[1px] shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                  isDark
                    ? 'bg-[#3E200C] text-[#FFF9EE] border-[#52270A] hover:bg-[#52270A]'
                    : 'bg-[#FFF9EE] text-[#5A2D0C] border-[#D9C8B0] hover:bg-[#F2E8D8]'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-[#C88D3A]" aria-hidden="true" />
                <span className="hidden md:inline">{homeLabel || 'Dev Entry'}</span>
              </button>
            )}
          </div>

          {/* Center: Contextual Breadcrumb / Title */}
          <div className="flex-1 min-w-0 px-1 sm:px-3">
            {previewContext ? (
              <nav
                aria-label="Governance Hierarchy Breadcrumb"
                className="flex items-center text-[11px] sm:text-xs font-medium truncate overflow-x-auto scrollbar-none py-1"
              >
                <span className="font-semibold shrink-0 text-[#5A2D0C] dark:text-[#FFF9EE]">
                  {previewContext.institutionName || 'Hut4Devs'}
                </span>

                {previewContext.campusName && (
                  <>
                    <ChevronRight className="w-3 h-3 mx-1 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                    <span className="shrink-0 text-[#5A2D0C] dark:text-[#EAD6C0]">
                      {previewContext.campusName}
                    </span>
                  </>
                )}

                {previewContext.accommodationSpaceName && (
                  <>
                    <ChevronRight className="w-3 h-3 mx-1 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                    <span className="hidden sm:inline shrink-0 text-[#5A2D0C]/80 dark:text-[#EAD6C0]/80">
                      {previewContext.accommodationSpaceName}
                    </span>
                  </>
                )}

                {previewContext.roomNumber && (
                  <>
                    <ChevronRight className="w-3 h-3 mx-1 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#C88D3A]/15 text-[#8A500D] dark:text-[#F3BA6B] font-mono font-bold">
                      {previewContext.roomNumber}
                    </span>
                  </>
                )}

                {!previewContext.roomNumber && previewContext.categoryLabel && (
                  <>
                    <ChevronRight className="w-3 h-3 mx-1 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                    <span className="hidden lg:inline shrink-0 text-[#5A2D0C]/75 dark:text-[#EAD6C0]/75">
                      {previewContext.categoryLabel}
                    </span>
                  </>
                )}

                {previewContext.roleTitle && (
                  <>
                    <ChevronRight className="w-3 h-3 mx-1 shrink-0 text-[#C88D3A]" aria-hidden="true" />
                    <span className="shrink-0 font-bold text-[#B77620] dark:text-[#F3BA6B] truncate">
                      {previewContext.roleTitle}
                    </span>
                  </>
                )}
              </nav>
            ) : title ? (
              <div className="truncate">
                <span className="text-xs sm:text-sm font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">
                  {title}
                </span>
                {subtitle && (
                  <span className="hidden sm:inline text-xs text-[#5A2D0C]/60 dark:text-[#FFF9EE]/60 ml-2">
                    • {subtitle}
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {/* Right: Actions, Mode Switcher, Theme Toggle, Log Out */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {rightActions}

            {currentMember && onModeChange && (
              <ModeSwitcher
                member={currentMember}
                scopedRoles={scopedRoles}
                currentMode={activeMode || 'FELLOW'}
                onModeChange={onModeChange}
                isDark={isDark}
              />
            )}

            {onToggleTheme && (
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            )}

            {onLogout && (
              <button
                type="button"
                id="header-logout-btn"
                onClick={onLogout}
                aria-label="Log Out"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isDark ? 'text-[#C88D3A] hover:text-[#FFF9EE]' : 'text-[#8A5D3B] hover:text-[#5A2D0C]'
                }`}
              >
                Log Out
              </button>
            )}

            {onExitToLanding && !previewContext?.isDevPreview && (
              <button
                type="button"
                id="header-exit-landing-btn"
                onClick={onExitToLanding}
                aria-label="Exit to Public Landing"
                title="Exit to Public Landing"
                className={`p-2 min-h-[36px] rounded-xl text-xs font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] ${
                  isDark
                    ? 'text-[#C88D3A] hover:text-[#FFF9EE] hover:bg-[#3E200C]'
                    : 'text-[#8A5D3B] hover:text-[#5A2D0C] hover:bg-[#EAE0D0]'
                }`}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Exit to Landing</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

/**
 * Hut4DevsWorkspaceFrameProps:
 * Wrapper providing unified workspace background, sticky header, and content bounds.
 */
export interface Hut4DevsWorkspaceFrameProps {
  isDark: boolean;
  headerProps: Hut4DevsHeaderProps;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const Hut4DevsWorkspaceFrame: React.FC<Hut4DevsWorkspaceFrameProps> = ({
  isDark,
  headerProps,
  children,
  className = '',
  contentClassName = '',
}) => {
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#2F1707] text-[#FFF9EE]' : 'bg-[#F7F1E7] text-[#5A2D0C]'
      } ${className}`}
    >
      <Hut4DevsHeader {...headerProps} isDark={isDark} />
      <div className={contentClassName}>{children}</div>
    </div>
  );
};

export interface Hut4DevsFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  isDark?: boolean;
  variant?: 'card' | 'surface' | 'highlight' | 'subtle';
  children: React.ReactNode;
}

/**
 * Hut4DevsFrame: Unified External Brand Frame Primitive
 *
 * Core Principle: "THIRD-PARTY / SEMANTIC COLOR INSIDE, HUT4DEVS BRAND FRAME OUTSIDE"
 * Enforces the brand palette:
 * - Warm ivory: #F7F1E7
 * - Soft cream: #FFF9EE
 * - Dark chocolate: #5A2D0C
 * - Caramel gold: #C88D3A
 * - Deep golden brown: #B77620
 * - Dark surface: #2F1707
 */
export const Hut4DevsFrame: React.FC<Hut4DevsFrameProps> = ({
  isDark = false,
  variant = 'card',
  className = '',
  style = {},
  children,
  ...rest
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';

  const variantStyles = {
    card: isDark
      ? 'bg-[rgba(23,21,19,0.55)] text-[#FFF9EE] border-2 border-[#C88D3A]/35 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(200,141,58,0.2)]'
      : 'bg-[rgba(255,253,248,0.65)] text-[#2B211B] border-2 border-[#5A2D0C]/25 shadow-[0_8px_30px_-6px_rgba(90,45,12,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]',
    surface: isDark
      ? 'bg-[rgba(30,27,24,0.45)] text-[#FFF9EE] border border-[#C88D3A]/25 shadow-xs'
      : 'bg-[rgba(247,241,231,0.50)] text-[#2B211B] border border-[#5A2D0C]/18 shadow-xs',
    highlight: isDark
      ? 'bg-[rgba(42,34,28,0.60)] text-[#FFF9EE] border-2 border-[#C88D3A] shadow-[0_10px_35px_-5px_rgba(200,141,58,0.25),inset_0_1px_0_rgba(226,171,93,0.3)]'
      : 'bg-[rgba(255,249,238,0.75)] text-[#2B211B] border-2 border-[#C88D3A] shadow-[0_10px_35px_-5px_rgba(200,141,58,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]',
    subtle: isDark
      ? 'bg-[rgba(23,21,19,0.35)] text-[#FFF9EE] border border-[#C88D3A]/20'
      : 'bg-[rgba(255,253,248,0.40)] text-[#2B211B] border border-[#5A2D0C]/15',
  };

  return (
    <div
      className={`${baseClasses} ${variantStyles[variant]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface BrandedSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  isDark?: boolean;
  elevation?: 1 | 2 | 3;
  children: React.ReactNode;
}

/**
 * BrandedSurface: Internal nested surface within Hut4Devs brand geometry
 */
export const BrandedSurface: React.FC<BrandedSurfaceProps> = ({
  isDark = false,
  elevation = 1,
  className = '',
  children,
  style = {},
  ...rest
}) => {
  const elevationStyles = {
    1: isDark
      ? 'bg-[rgba(30,27,24,0.45)] border border-[#C88D3A]/20 text-[#FFF9EE]'
      : 'bg-[rgba(247,241,231,0.50)] border border-[#5A2D0C]/15 text-[#2B211B]',
    2: isDark
      ? 'bg-[rgba(42,34,28,0.55)] border border-[#C88D3A]/30 text-[#FFF9EE]'
      : 'bg-[rgba(255,249,238,0.65)] border border-[#C88D3A]/25 text-[#2B211B]',
    3: isDark
      ? 'bg-[rgba(50,40,32,0.65)] border border-[#C88D3A]/45 text-[#FFF9EE]'
      : 'bg-[rgba(255,255,255,0.75)] border border-[#C88D3A]/35 text-[#2B211B]',
  };

  return (
    <div
      className={`rounded-xl p-4 transition-colors duration-150 ${elevationStyles[elevation]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface BrandedActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDark?: boolean;
  variant?: 'bmoni' | 'primary' | 'secondary' | 'accent' | 'gift' | 'loan' | 'contribution';
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * BrandedActionButton: 3D Raised Interaction Button
 */
export const BrandedActionButton: React.FC<BrandedActionButtonProps> = ({
  isDark = false,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const variantStyles = {
    bmoni: isDark
      ? 'bg-[#2563EB] text-white border-b-4 border-[#1E3A8A] hover:bg-[#3B82F6] hover:border-[#1D4ED8] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#1D4ED8] text-white border-b-4 border-[#172554] hover:bg-[#2563EB] hover:border-[#1E3A8A] hover:shadow-[0_8px_25px_rgba(37,99,235,0.45)] active:border-b-1 active:translate-y-[2px]',
    primary: isDark
      ? 'bg-[#C88D3A] text-[#2F1707] border-b-4 border-[#8E560C] hover:bg-[#DDA250] hover:shadow-[0_6px_18px_rgba(200,141,58,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#5A2D0C] text-[#FFF9EE] border-b-4 border-[#351A07] hover:bg-[#432108] hover:shadow-[0_6px_18px_rgba(90,45,12,0.3)] active:border-b-1 active:translate-y-[2px]',
    secondary: isDark
      ? 'bg-[#2F1707] text-[#E5D3BA] border-b-4 border-[#1A0C04] hover:bg-[#3E200C] hover:text-[#FFF9EE] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#FFF9EE] text-[#5A2D0C] border-b-4 border-[#D9C8B0] hover:bg-[#F2E8D8] active:border-b-1 active:translate-y-[2px]',
    accent: isDark
      ? 'bg-[#B77620] text-white border-b-4 border-[#7A4B0A] hover:bg-[#C88D3A] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#B77620] text-white border-b-4 border-[#8E560C] hover:bg-[#9E6316] active:border-b-1 active:translate-y-[2px]',
    gift: isDark
      ? 'bg-[#059669] text-white border-b-4 border-[#064E3B] hover:bg-[#10B981] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#047857] text-white border-b-4 border-[#064E3B] hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(4,120,87,0.3)] active:border-b-1 active:translate-y-[2px]',
    loan: isDark
      ? 'bg-[#2563EB] text-white border-b-4 border-[#1E3A8A] hover:bg-[#3B82F6] hover:shadow-[0_6px_20px_rgba(59,130,246,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#1D4ED8] text-white border-b-4 border-[#172554] hover:bg-[#2563EB] hover:shadow-[0_6px_20px_rgba(29,78,216,0.3)] active:border-b-1 active:translate-y-[2px]',
    contribution: isDark
      ? 'bg-[#7C3AED] text-white border-b-4 border-[#4C1D95] hover:bg-[#8B5CF6] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)] active:border-b-1 active:translate-y-[2px]'
      : 'bg-[#6D28D9] text-white border-b-4 border-[#4C1D95] hover:bg-[#7C3AED] hover:shadow-[0_6px_20px_rgba(109,40,217,0.3)] active:border-b-1 active:translate-y-[2px]',
  };

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer select-none ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed transform-none shadow-none'
          : 'hover:-translate-y-[2px] active:translate-y-[1px]'
      } ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

