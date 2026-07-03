'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import { StepCompanyInfo } from '@/components/onboarding/StepCompanyInfo';
import { StepDepartments } from '@/components/onboarding/StepDepartments';
import { StepLocations } from '@/components/onboarding/StepLocations';
import { StepBusinessHours } from '@/components/onboarding/StepBusinessHours';
import { StepRoles } from '@/components/onboarding/StepRoles';
import { StepShiftTemplates } from '@/components/onboarding/StepShiftTemplates';
import { StepInviteEmployees } from '@/components/onboarding/StepInviteEmployees';
import { genId, type OnboardingData, type DayOfWeek } from '@/components/onboarding/types';

// ─── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

const STEP_LABELS = [
  'Company info',
  'Departments',
  'Locations',
  'Business hours',
  'Roles',
  'Shift templates',
  'Invite employees',
];

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function initialData(): OnboardingData {
  const operationsId = genId('dept');
  const salesId = genId('dept');
  const cashierRoleId = genId('role');
  const floorRoleId = genId('role');

  return {
    company: {
      companyName: 'Northgate Co.',
      industry: 'Retail',
      timeZone: 'Pacific Time (US & Canada)',
    },
    departments: [
      { id: operationsId, name: 'Operations', color: '#7C6AC4' },
      { id: salesId, name: 'Sales', color: '#5A9B6E' },
    ],
    locations: [{ id: genId('loc'), name: 'Main Store', address: '' }],
    businessHours: DAYS.map((day) => ({
      day,
      open: day !== 'Sun',
      openTime: '09:00',
      closeTime: '21:00',
    })),
    roles: [
      { id: cashierRoleId, name: 'Cashier', departmentId: salesId },
      { id: floorRoleId, name: 'Floor Associate', departmentId: operationsId },
    ],
    shiftTemplates: [
      {
        id: genId('tmpl'),
        name: 'Opening Shift',
        startTime: '09:00',
        endTime: '17:00',
        roleId: cashierRoleId,
      },
    ],
    invites: [{ id: genId('invite'), name: '', email: '', roleId: cashierRoleId }],
    sendInviteEmails: true,
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);

  const goToDashboard = () => router.push('/schedule');

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleContinue = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      goToDashboard();
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <div
      style={{
        background: 'var(--bg)',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          background: 'var(--surface)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                }}
              >
                Set up workspace
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Step {currentStep} of {TOTAL_STEPS} &middot; {STEP_LABELS[currentStep - 1]}
              </span>
            </div>

            <button
              type="button"
              onClick={goToDashboard}
              aria-label="Close"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 99,
                  background: idx <= currentStep - 1 ? 'var(--accent)' : 'var(--surface-3)',
                  transition: 'background 0.2s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }}>
          {currentStep === 1 && (
            <StepCompanyInfo
              data={data.company}
              setData={(company) => setData((d) => ({ ...d, company }))}
            />
          )}
          {currentStep === 2 && (
            <StepDepartments
              data={data.departments}
              setData={(departments) => setData((d) => ({ ...d, departments }))}
            />
          )}
          {currentStep === 3 && (
            <StepLocations
              data={data.locations}
              setData={(locations) => setData((d) => ({ ...d, locations }))}
            />
          )}
          {currentStep === 4 && (
            <StepBusinessHours
              data={data.businessHours}
              setData={(businessHours) => setData((d) => ({ ...d, businessHours }))}
            />
          )}
          {currentStep === 5 && (
            <StepRoles
              data={data.roles}
              setData={(roles) => setData((d) => ({ ...d, roles }))}
              departments={data.departments}
            />
          )}
          {currentStep === 6 && (
            <StepShiftTemplates
              data={data.shiftTemplates}
              setData={(shiftTemplates) => setData((d) => ({ ...d, shiftTemplates }))}
              roles={data.roles}
            />
          )}
          {currentStep === 7 && (
            <StepInviteEmployees
              data={data.invites}
              setData={(invites) => setData((d) => ({ ...d, invites }))}
              roles={data.roles}
              sendInviteEmails={data.sendInviteEmails}
              setSendInviteEmails={(sendInviteEmails) =>
                setData((d) => ({ ...d, sendInviteEmails }))
              }
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 4px',
              }}
            >
              <ChevronLeft size={15} />
              Back
            </button>
          ) : (
            <span />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              type="button"
              onClick={goToDashboard}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={handleContinue}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 38,
                paddingInline: 18,
                borderRadius: 8,
                border: 'none',
                background: 'var(--accent)',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLastStep ? 'Finish setup' : 'Continue'}
              {!isLastStep && <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
