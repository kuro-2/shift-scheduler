'use client';

import { InfoBanner } from './InfoBanner';
import { inputStyle, labelStyle, type CompanyInfo } from './types';

const INDUSTRIES: CompanyInfo['industry'][] = ['Retail', 'Hospitality', 'Healthcare', 'Other'];

const TIME_ZONES = [
  'Pacific Time (US & Canada)',
  'Mountain Time (US & Canada)',
  'Central Time (US & Canada)',
  'Eastern Time (US & Canada)',
  'Atlantic Time (Canada)',
  'UTC',
  'London',
  'Central European Time',
];

interface StepCompanyInfoProps {
  data: CompanyInfo;
  setData: (data: CompanyInfo) => void;
}

export function StepCompanyInfo({ data, setData }: StepCompanyInfoProps) {
  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Tell us about your company
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        This helps us set up your workspace correctly.
      </p>

      <InfoBanner>
        This information appears on schedules and employee-facing screens.
      </InfoBanner>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Company name</label>
        <input
          type="text"
          value={data.companyName}
          onChange={(e) => setData({ ...data, companyName: e.target.value })}
          placeholder="Acme Co."
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Industry</label>
          <select
            value={data.industry}
            onChange={(e) =>
              setData({ ...data, industry: e.target.value as CompanyInfo['industry'] })
            }
            style={inputStyle}
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Time zone</label>
          <select
            value={data.timeZone}
            onChange={(e) => setData({ ...data, timeZone: e.target.value })}
            style={inputStyle}
          >
            {TIME_ZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
