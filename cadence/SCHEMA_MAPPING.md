# Nexora × PRD_NEXORA.ANALYTICS — Schema Mapping

> Database: `PRD_NEXORA.ANALYTICS`  
> Last updated: 2026-06-30  
> Purpose: Documents every table in the Snowflake schema — which are used by the Nexora shift scheduler, why, and what future features the unused tables enable.

---

## 1. Tables Used by Nexora (Active)

### 1.1 `APP_USER_ACCOUNTS` — HYBRID TABLE
**Used by:** `src/services/auth.service.ts` → `/login`, `/forgot`, `/reset`, `/otp` routes  
**Why:** This is the application's authentication table. It stores manager/admin login credentials (hashed password), their assigned location, role level (ADMIN / MANAGER / VIEWER), and lockout tracking via `FAILED_LOGIN_COUNT`. The composite PK `(USERNAME, LOCATION_ID)` naturally models a multi-location setup where the same person can be manager of multiple stores with different roles.

| Column | App Usage |
|---|---|
| `USERNAME` | Login username |
| `PASSWORD_HASH` | bcrypt-verified on sign-in |
| `LOCATION_ID` | Which store this login controls |
| `USER_ROLE` | Gates UI features (ADMIN sees all, VIEWER read-only) |
| `IS_ACTIVE` | Deactivate without deleting account |
| `LAST_LOGIN_AT` | Session audit + "last seen" in admin panel |
| `FAILED_LOGIN_COUNT` | Lockout after 5 consecutive failures |

**CRUD operations:**
- `signIn(username, password, locationId)` — SELECT + verify hash + UPDATE LAST_LOGIN_AT
- `signOut(username, locationId)` — no-op (stateless JWT approach)
- `getUserAccount(username, locationId)` — SELECT for profile display
- `createUserAccount(input)` — INSERT (admin creating manager logins)
- `updateUserAccount(username, locationId, patch)` — UPDATE role / IS_ACTIVE
- `recordFailedLogin(username, locationId)` — UPDATE FAILED_LOGIN_COUNT + 1

---

### 1.2 `DIM_EMPLOYEE_CURATED` — TABLE
**Used by:** `src/services/employees.service.ts` → `/people`, `/schedule`, `/attendance`, `/reports` routes  
**Why:** This is the master employee record used for all read/write operations in the scheduler. It's the "curated" version (cleaned, enriched) vs `DIM_EMPLOYEE` which may reflect raw POS data. All shift scheduling, attendance lookup, and cost calculations reference `EMPLOYEE_KEY` / `EMPLOYEE_ID` from this table.

| Column | App Usage |
|---|---|
| `EMPLOYEE_KEY` | Internal surrogate FK for all fact table joins |
| `EMPLOYEE_ID` | Natural business key shown in UI / used in STORE_MANUAL_LABOR_HOURS |
| `FIRST_NAME`, `LAST_NAME` | Display in schedule grid, people table |
| `EMAIL` | Contact info, profile drawer |
| `PHONE_NUMBER` | Emergency/contact info |
| `JOB_TITLE` | Shown on shift cards, person row in grid |
| `JOB_ROLE` | Used for shift role matching |
| `DEPARTMENT` | Department breakdown in reports |
| `EMPLOYMENT_TYPE` | Full-time / Part-time badge |
| `HOURLY_RATE` | Cost estimates on shift creation drawer |
| `EMPLOYMENT_STATUS` | Filter active/inactive in people table |
| `HIRE_DATE` | "Active since" in employee profile drawer |
| `LOCATION_KEY` | Which store the employee belongs to |
| `MANAGER_EMPLOYEE_KEY` | Management hierarchy (future org chart) |
| `DEL_TS` | Soft-delete: departed employees hidden but data preserved |

**CRUD operations:**
- `getEmployees(filter?)` — SELECT WHERE DEL_TS IS NULL AND EMPLOYMENT_STATUS != 'Terminated'
- `getEmployee(id)` — SELECT by EMPLOYEE_KEY
- `createEmployee(input)` — INSERT (onboarding wizard step 7 "Invite employees")
- `updateEmployee(id, patch)` — UPDATE (profile edit drawer)
- `deleteEmployee(id)` — UPDATE DEL_TS = CURRENT_TIMESTAMP() (soft-delete)
- `getEmployeesByLocation(locationId)` — SELECT JOIN DIM_LOCATION WHERE LOCATION_ID = ?

---

### 1.3 `DIM_LOCATION` — TABLE
**Used by:** `src/services/employees.service.ts` → `/settings/locations`, shift creation drawer, employee profile  
**Why:** Locations are referenced everywhere — employees belong to a location, shifts are scheduled at a location, attendance is geo-verified against a location's coordinates (GPS geofence). The `LATITUDE` / `LONGITUDE` + `CUSTOMER_NUMBER` fields support the mobile clock-in GPS check.

| Column | App Usage |
|---|---|
| `LOCATION_KEY` | Surrogate FK used in all fact tables |
| `LOCATION_ID` | Natural key used in STORE_MANUAL_LABOR_HOURS, APP_USER_ACCOUNTS |
| `LOCATION_NAME` | Displayed in shift cards, attendance table, mobile clock-in screen |
| `LOCATION_CODE` | Short identifier in API payloads |
| `ADDRESS_LINE1`, `CITY`, `STATE` | Shown in `/settings/locations` cards |
| `LATITUDE`, `LONGITUDE` | GPS geofence check on mobile clock-in |
| `TIMEZONE` | Shift time display, scheduling timezone awareness |
| `MANAGER_NAME` | Informational in location settings card |
| `LOCATION_STATUS` | Active/inactive filter |
| `CUSTOMER_NUMBER` | Inventory supplier reference (future ordering integration) |

**CRUD operations:**
- `getLocations()` — SELECT WHERE DEL_TS IS NULL AND LOCATION_STATUS = 'Active'
- `getLocation(id)` — SELECT by LOCATION_KEY or LOCATION_ID
- `createLocation(input)` — INSERT (onboarding wizard step 3)
- `updateLocation(id, patch)` — UPDATE (settings/locations page)

---

### 1.4 `STORE_MANUAL_LABOR_HOURS` — HYBRID TABLE
**Schema:** `DEV_NEXORA.RAW` — **not** `ANALYTICS`, unlike every other table on this page. Referenced in code via the `SF_RAW` constant exported from `src/lib/snowflake.ts` (all other tables use `SF_DB`, which resolves to `ANALYTICS`).
**Used by:** `src/services/shifts.service.ts` → `/schedule` (the hero screen), `/m/schedule`, `/m/clock`  
**Why:** This is the **primary writable table for the scheduler**. When a manager creates or edits a shift in the week grid, the write goes here. It's a hybrid table (Snowflake's row-store mode) for low-latency point lookups needed by the real-time scheduler. The composite PK ensures no duplicate shifts for the same employee at the same location, same day and start time.

| Column | App Usage |
|---|---|
| `EMPLOYEE_ID` | Which employee the shift is assigned to |
| `LOCATION_ID` | Which store the shift is at |
| `WORK_DATE` | The date column (week grid rows by date) |
| `SHIFT_NO` | Multiple shifts per day for one employee |
| `DAY_NAME` | Day label in grid header |
| `START_TIME` | Shift card time display |
| `END_TIME` | Shift card time display |
| `HOURS_WORKED` | Auto-computed: (END_TIME - START_TIME) |
| `PAY_TYPE` | 'HOURLY' or 'SALARY' affects cost calculation |

**CRUD operations:**
- `getShifts(filter)` — SELECT JOIN DIM_EMPLOYEE_CURATED WHERE LOCATION_ID = ? AND WORK_DATE BETWEEN ? AND ?
- `createShift(input)` — INSERT (+ button in empty cell, Create Shift drawer)
- `updateShift(compositeKey, patch)` — UPDATE (drag-drop to new slot, edit in detail drawer)
- `deleteShift(compositeKey)` — DELETE (delete button in shift detail drawer)
- `publishWeek(weekStart)` — batch MERGE + call upsertWeeklyLaborSummary
- `assignShift(shiftId, employeeId)` — UPDATE EMPLOYEE_ID (assign open shift)
- `unassignShift(shiftId)` — UPDATE EMPLOYEE_ID = NULL (make shift open)

---

### 1.5 `STORE_MANUAL_LABOR_WEEKLY_SUMMARY` — HYBRID TABLE
**Used by:** `src/services/shifts.service.ts` (write on publishWeek), `src/services/reports.service.ts` (read for KPIs)  
**Why:** Pre-aggregated weekly rollup of labor cost per employee per location. This is what powers the Reports page KPI tiles (Labor Cost, Overtime Hours) without doing expensive GROUP BY aggregations on `FACT_LABOR_HOURS` at report time. Written by `publishWeek()` in the scheduler.

| Column | App Usage |
|---|---|
| `LOCATION_ID`, `EMPLOYEE_ID`, `WEEK_START_DT` | PK — uniquely identifies a work week |
| `REG_HOURS`, `OT_HOURS` | Reports KPI tiles: "Hours this week" |
| `REG_COST`, `OT_COST`, `TOTAL_COST` | Reports KPI tile: "Labor cost" |
| `PAY_TYPE` | 'HOURLY' vs 'SALARY' cost calculation method |
| `IS_MANUAL_OVERRIDE` | Flag when manager manually adjusts auto-computed cost |
| `MANUAL_WEEKLY_SALARY` | For salaried employees: fixed weekly cost override |

**CRUD operations:**
- `getWeeklyLaborSummary(locationId, weekStart)` — SELECT WHERE LOCATION_ID = ? AND WEEK_START_DT = ?
- `upsertWeeklyLaborSummary(input)` — MERGE INTO (called from publishWeek)

---

### 1.6 `FACT_LABOR_HOURS` — TABLE
**Used by:** `src/services/attendance.service.ts` → `/attendance`, `/reports` (department breakdown, top performers)  
**Why:** This is the **source of truth for actual clock-in/out data** as it flows from the POS system (via ETL from `PAR_GETSHIFTS_STG`). The scheduler reads it to show actual vs scheduled times, late arrivals, no-shows, and overtime. It's read-only from the scheduler's perspective — written by the ETL pipeline from POS data.

| Column | App Usage |
|---|---|
| `EMPLOYEE_KEY` | Join to DIM_EMPLOYEE_CURATED for name/dept |
| `LOCATION_KEY` | Filter by store |
| `WORK_DATE` | Attendance table date filter |
| `CLOCK_IN_TIME`, `CLOCK_OUT_TIME` | Attendance table columns (monospace display) |
| `SCHEDULED_START_TIME`, `SCHEDULED_END_TIME` | Compare vs actual for late/early detection |
| `REGULAR_HOURS`, `OVERTIME_HOURS` | Weekly hours display in person column of scheduler |
| `TOTAL_HOURS` | "Xh / Yh" display in schedule grid person cell |
| `REGULAR_HOURLY_RATE` | Cost calculation on shift creation drawer estimate |
| `REGULAR_COST`, `OVERTIME_COST`, `TOTAL_LABOR_COST` | Reports department breakdown |
| `ATTENDANCE_STATUS` | StatusPill in attendance table |
| `IS_LATE`, `IS_NO_SHOW`, `LATE_MINUTES` | Late indicator (amber text on clock-in time), no-show stat tile |

**CRUD operations (read-heavy):**
- `getAttendanceEvents(date?, locationId?)` — SELECT JOIN DIM_EMPLOYEE_CURATED WHERE WORK_DATE = ? AND LOCATION_KEY = ?
- `getAttendanceByDateRange(locationId, from, to)` — SELECT for reports
- `getLaborCostSummary(locationId, weekStart)` — SELECT SUM() GROUP BY for KPIs
- `updateAttendanceStatus(eventId, status)` — UPDATE ATTENDANCE_STATUS (manager override)
- `clockIn(employeeId, locationId)` — UPDATE SET CLOCK_IN_TIME (mobile app clock-in)
- `clockOut(employeeId, locationId, date)` — UPDATE SET CLOCK_OUT_TIME (mobile app clock-out)

---

### 1.7 `STORE_MANUAL_EXPENSES` — HYBRID TABLE
**Used by:** `src/services/reports.service.ts` → `/reports`  
**Why:** Store managers manually enter controllable expenses (rent, utilities, fuel, repairs) that aren't captured by the POS system. The Reports page can combine these with labor cost from `STORE_MANUAL_LABOR_WEEKLY_SUMMARY` to show total store operating cost. Writable from the app.

| Column | App Usage |
|---|---|
| `LOCATION_ID` | Which store |
| `EXPENSE_TYPE` | Category label (Rent, Utilities, Fuel, Repairs, Marketing) |
| `EXPENSE_MONTH` | Month filter for reports |
| `EXPENSE_AMT` | Dollar amount |
| `EXPENSE_DT` | Entry date (audit / change history) |
| `EXPENSE_COMMENTS` | Notes shown in reports table |

**CRUD operations:**
- `getMonthlyExpenses(locationId, month)` — SELECT GROUP BY EXPENSE_TYPE WHERE EXPENSE_MONTH = DATE_TRUNC('month', ?)
- `createExpenseEntry(input)` — INSERT (future: expense entry UI in reports or settings)

---

### 1.8 `DIM_SHIFT` — TABLE
**Used by:** `src/services/shifts.service.ts` → Create Shift drawer (shift type selector), settings/templates  
**Why:** Reference dimension for standard shift definitions (e.g. "Opening Shift" 7AM-3PM, "Closing Shift" 3PM-11PM). When a manager creates a shift, they can pick from predefined types rather than entering times manually. Maps directly to the "Shift templates" concept in the settings and onboarding wizard.

| Column | App Usage |
|---|---|
| `SHIFT_ID`, `SHIFT_NAME` | Dropdown options in Create Shift drawer |
| `START_TIME`, `END_TIME` | Auto-fill when template is selected |
| `DURATION_HOURS` | Displayed alongside template name |
| `SHIFT_TYPE` | Category label (Morning / Afternoon / Evening / Overnight) |
| `IS_OVERNIGHT` | Flag to handle overnight shift time display (span two dates) |
| `SHIFT_STATUS` | Filter to Active templates only |

**CRUD operations:**
- `getShiftTypes()` — SELECT WHERE SHIFT_STATUS = 'Active' AND DEL_TS IS NULL (read-only from app)

---

### 1.9 `DIM_DATE` — TABLE
**Used by:** `src/services/` (indirectly in joins), `src/lib/date.ts` (date math)  
**Why:** Standard date dimension used in Snowflake joins (`FACT_LABOR_HOURS.DATE_KEY → DIM_DATE.DATE_KEY`) to filter by week, month, business-day-only KPIs, and holiday exclusions in scheduling. The app's date utilities mirror the same calendar structure (week start, week label, day name) defined here.

| Column | App Usage |
|---|---|
| `DATE_KEY` | Join key for all FACT tables |
| `FULL_DATE` | Filter target (`WHERE FULL_DATE BETWEEN ? AND ?`) |
| `DAY_NAME` | Day labels in schedule grid header |
| `WEEK_OF_YEAR` | Grouping in reports charts |
| `IS_WEEKEND`, `IS_HOLIDAY` | Future: visually highlight holidays in scheduler |
| `IS_BUSINESS_DAY` | Future: filter for business-hour cost calculations |

---

## 2. Tables Used Indirectly (ETL sources — read-only reference)

These tables are written by the ETL pipeline from the POS system and READ by the app (through `FACT_LABOR_HOURS` aggregations). The app does not write to them directly.

| Table | Role | App Link |
|---|---|---|
| `PAR_GETSHIFTS_STG` | Raw shift clock-in/out data from POS API, flattened for ETL | Source data that populates `FACT_LABOR_HOURS` |
| `PAR_GETSHIFTS_STG_HIST` | Historical version of above | Audit / backfill source |
| `PAR_GETEMPLOYEES_STG` | Raw employee data from POS (Aloha/Toast) | Source data for `DIM_EMPLOYEE_CURATED` |
| `DIM_EMPLOYEE` | Master employee dimension (may include all historical) | `DIM_EMPLOYEE_CURATED` is the cleaner version used by app |
| `FACT_STORE_METRICS` | Daily store KPIs (revenue, COGS, labor %) | Reports page future enhancement |

---

## 3. Tables NOT Used by Nexora Shift Scheduler

These tables exist in `PRD_NEXORA.ANALYTICS` but have no current connection to the Nexora scheduler. They serve other applications (POS analytics, supply chain, finance).

| Table | Domain | Why Not Used |
|---|---|---|
| `FACT_SALES` | Sales transactions | Nexora is scheduling-only; no POS sales data needed |
| `FACT_SALES_LINE` | Sales line items | Same as above |
| `DIM_PRODUCT` | Menu products | No product catalog in scheduler |
| `DIM_PRODUCT_BOM` | Bill of materials | Supply/kitchen ops, not workforce |
| `DIM_PRODUCT_BRIDGE` | Product relationships | Same |
| `DIM_PRODUCT_COMPONENT` | Combo meal composition | Same |
| `DIM_PRODUCT_BOM_TEMP` | BOM temp table | Staging artifact |
| `DIM_CUSTOMER` | Customer profiles | Nexora is manager/employee-facing |
| `FACT_CUSTOMER_ACTIVITY` | Loyalty/engagement events | No customer-facing features |
| `DIM_SALES_CHANNEL` | Online/offline channels | Not relevant to workforce scheduling |
| `DIM_PAYMENT_METHOD` | Payment types | Not relevant to scheduling |
| `DIM_PROMOTION` | Discount/promo definitions | Not relevant to scheduling |
| `FACT_PURCHASE_ORDER` | PO header records | Supply chain management |
| `FACT_PURCHASE_ORDER_LINE` | PO line items | Same |
| `DIM_SUPPLY_ITEM` | Raw ingredient SKUs | Inventory management |
| `FACT_INVENTORY_TRANSACTION` | Stock movement | Inventory management |
| `FACT_INVENTORY_CONSUMPTION` | Ingredient usage per product | Kitchen ops / recipe costing |
| `DIM_SUPPLIER` | Vendor records | Procurement |
| `FACT_EQUIPMENT_MAINTENANCE` | Equipment repair log | Maintenance ops |
| `FACT_EXPENSES` | General expense ledger | Finance / accounting |
| `DIM_EXPENSE_CATEGORY` | Expense GL codes | Finance |
| `DIM_WEATHER` | Daily weather data | Not used (future: correlate staffing with weather) |
| `DIM_BRAND` | Multi-brand hierarchy | Not directly surfaced in app UI (read from LOCATION via BRAND_KEY) |
| `DIM_TIME` | Time-of-day dimension | Joins in Snowflake only; app uses JS `Date` |
| `APP_USER_ACCOUNTS_REPORTS` | PowerBI report access per user | Nexora has its own report pages |
| `APP_USER_ACCOUNTS_BKP` | Auth backup table | Maintenance artifact |
| `SOFO_PURCHASE_ORDER_STG` | Supplier order staging | Supply chain |
| `SOFO_PURCHASE_ORDER_TEMP` | PO temp | Supply chain |
| `SOFO_PURCHASE_ORDER_LINE_STG` | PO line staging | Supply chain |
| `SOFO_PURCHASE_ORDER_LINE_TEMP` | PO line temp | Supply chain |
| `SOFO_INVENTORY_ORDERS` | Inventory order data | Supply chain |
| `SOFO_INVENTORY_ORDERS_STG` | Inventory staging | Supply chain |
| `SOFO_INVENTORY_ORDERS_HIST` | Inventory history | Supply chain |
| `SOFO_ITEMLIST_TEMP` | Item list temp | Supply chain |
| `PAR_GETORDERS` | Raw order API data | Sales/POS analytics |
| `PAR_GETORDERS_HIST` | Order API history | Sales/POS analytics |
| `PAR_GETORDERS_PARENT_STG` | Flattened order staging | Sales/POS analytics |
| `PAR_GETORDERS_PARENT_STG_HIST` | Historical flattened orders | Sales/POS analytics |
| `PAR_GETMENU` | Raw menu API data | Product/menu management |
| `PAR_GETMENU_HIST` | Menu API history | Product/menu management |
| `PAR_GETMENU_STG` | Flattened menu staging | Product/menu management |
| `PAR_GETMENU_STG_HIST` | Historical menu staging | Product/menu management |
| `PAR_GETITEMS` | Raw items API data | POS item catalog |
| `PAR_GETITEMS_HIST` | Items API history | POS item catalog |
| `PAR_GETITEMS_STG` | Flattened items staging | POS item catalog |
| `PAR_GETITEMS_STG_HIST` | Historical items staging | POS item catalog |
| `PAR_GETDESTINATIONS` | Raw destinations API | Order destination config |
| `PAR_GETDESTINATIONS_HIST` | Destinations history | Order destination config |
| `PAR_GETDESTINATIONS_STG` | Flattened destinations | Order destination config |
| `PAR_GETDESTINATIONS_STG_HIST` | Historical destinations | Order destination config |
| `PAR_GETSHIFTS` | Raw shifts API (unflattened) | ETL landing zone |
| `PAR_GETSHIFTS_HIST` | Raw shifts history | ETL landing zone |
| `PAR_GETEMPLOYEES` | Raw employees API | ETL landing zone |
| `PAR_GETEMPLOYEES_HIST` | Employees API history | ETL landing zone |
| `PAR_GETEMPLOYEES_STG_HIST` | Historical employees staging | ETL landing zone |
| `DIM_EMPLOYEE_DUMMY` | Transient dummy table | Dev/testing artifact |
| `DIM_EMPLOYEE_BKP_20160116` | Employee backup | Maintenance artifact |
| `DIM_DATE_BKP` | Date dim backup | Maintenance artifact |
| `REF_PAR_TENDER_CONFIG` | POS tender/payment config | POS configuration |
| `API_CONTROL` | API endpoint registry | ETL orchestration |
| `MAINETLCONFG` | ETL job config master | ETL infrastructure |
| `MAINETLCNTXT` | ETL context variables | ETL infrastructure |
| `MSTRETLLST` | ETL process run list | ETL infrastructure |
| `MAINETLRUNDTL` | ETL run audit log | ETL infrastructure |
| `SUBETLRUNDTL` | Sub-ETL run audit | ETL infrastructure |

---

## 4. Missing Tables — Recommended New Tables to Create

These Nexora features have no backing Snowflake table. When wiring up real data, create these hybrid tables in `PRD_NEXORA.ANALYTICS`:

```sql
-- Time-off requests (currently in-memory mock only)
CREATE OR REPLACE HYBRID TABLE APP_TIME_OFF_REQUESTS (
    REQUEST_ID    VARCHAR(250) NOT NULL,
    EMPLOYEE_ID   VARCHAR(250) NOT NULL,
    LOCATION_ID   VARCHAR(250) NOT NULL,
    REQUEST_TYPE  VARCHAR(50)  NOT NULL,  -- vacation, sick, personal, unpaid
    START_DATE    DATE         NOT NULL,
    END_DATE      DATE         NOT NULL,
    REASON        VARCHAR(1000),
    STATUS        VARCHAR(50)  DEFAULT 'pending',  -- pending, approved, rejected
    SUBMITTED_AT  TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    DECIDED_AT    TIMESTAMP_NTZ,
    DECIDED_BY    VARCHAR(250),
    MANAGER_COMMENT VARCHAR(1000),
    CREATED_AT    TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT    TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    CREATED_USER  VARCHAR(250)  DEFAULT CURRENT_USER(),
    UPDATED_USER  VARCHAR(250)  DEFAULT CURRENT_USER(),
    constraint PK_APP_TIME_OFF_REQUESTS primary key (REQUEST_ID)
);

-- Shift swap requests (currently in-memory mock only)
CREATE OR REPLACE HYBRID TABLE APP_SHIFT_SWAPS (
    SWAP_ID              VARCHAR(250) NOT NULL,
    FROM_EMPLOYEE_ID     VARCHAR(250) NOT NULL,
    TO_EMPLOYEE_ID       VARCHAR(250) NOT NULL,
    FROM_LOCATION_ID     VARCHAR(250) NOT NULL,
    FROM_WORK_DATE       DATE         NOT NULL,
    FROM_START_TIME      TIME         NOT NULL,
    FROM_SHIFT_NO        NUMBER(38,0) NOT NULL,
    TO_WORK_DATE         DATE         NOT NULL,
    TO_START_TIME        TIME         NOT NULL,
    TO_SHIFT_NO          NUMBER(38,0) NOT NULL,
    STATUS               VARCHAR(50)  DEFAULT 'pending',
    HAS_CONFLICT         BOOLEAN      DEFAULT FALSE,
    CONFLICT_REASONS     VARCHAR(1000),
    SUBMITTED_AT         TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    DECIDED_AT           TIMESTAMP_NTZ,
    DECIDED_BY           VARCHAR(250),
    CREATED_AT           TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT           TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    constraint PK_APP_SHIFT_SWAPS primary key (SWAP_ID)
);

-- In-app notifications (currently in-memory mock only)
CREATE OR REPLACE HYBRID TABLE APP_NOTIFICATIONS (
    NOTIFICATION_ID  VARCHAR(250)  NOT NULL,
    RECIPIENT_USERNAME VARCHAR(250) NOT NULL,
    LOCATION_ID      VARCHAR(250)  NOT NULL,
    NOTIFICATION_TYPE VARCHAR(50)  NOT NULL,  -- conflict, time_off, swap, late, published, mention
    TITLE            VARCHAR(500)  NOT NULL,
    SUBTITLE         VARCHAR(1000),
    ACTOR_EMPLOYEE_ID VARCHAR(250),
    IS_READ          BOOLEAN       DEFAULT FALSE,
    LINK             VARCHAR(500),
    CREATED_AT       TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    EXPIRES_AT       TIMESTAMP_NTZ,
    constraint PK_APP_NOTIFICATIONS primary key (NOTIFICATION_ID)
);
```

---

## 5. Future Feature Ideas (Using Unused Tables)

### 5.1 Sales vs. Labor Efficiency Dashboard
**Tables:** `FACT_SALES`, `FACT_STORE_METRICS`, `STORE_MANUAL_LABOR_WEEKLY_SUMMARY`  
**Feature idea:** Add a new "Performance" tab to the Reports page showing `SALES_PER_LABOR_HOUR` from `FACT_STORE_METRICS` plotted against scheduled labor hours. Managers can instantly see whether overstaffing or understaffing is impacting revenue. Correlate with `FACT_SALES` net sales by day to identify peak-day patterns and auto-suggest optimal staffing levels for each day of the week.

### 5.2 Weather-Aware Staffing Suggestions
**Tables:** `DIM_WEATHER`, `FACT_STORE_METRICS`, `FACT_SALES`  
**Feature idea:** Pull `DIM_WEATHER` data (temperature, precipitation, IS_SEVERE_WEATHER) and correlate with historical `FACT_SALES` and `FACT_STORE_METRICS` (customer count, transaction count) to surface insight banners in the scheduler: "Rainy weather forecast for Wednesday — historically your location sees 23% fewer customers. Consider reducing staffing by 2." Could feed an AI-powered staffing recommendation engine.

### 5.3 Customer Loyalty × Staffing Correlation
**Tables:** `FACT_CUSTOMER_ACTIVITY`, `DIM_CUSTOMER`, `FACT_STORE_METRICS`  
**Feature idea:** Show in Reports how `CUSTOMER_SATISFACTION_SCORE` from `FACT_STORE_METRICS` and `FEEDBACK_RATING` from `FACT_CUSTOMER_ACTIVITY` trend alongside staffing levels. Identify the optimal crew size that maximizes CSAT without over-spending on labor.

### 5.4 Equipment Downtime Staffing Impact
**Tables:** `FACT_EQUIPMENT_MAINTENANCE`  
**Feature idea:** When equipment is down (`MAINTENANCE_STATUS` = 'In Progress'), surface a warning in the Schedule page: "Fryer offline Mon-Tue — kitchen capacity reduced. Adjust floor staff accordingly." Use `DOWNTIME_HOURS` and `IMPACT_ON_OPERATIONS` to quantify the staffing impact. The Create Shift drawer could suggest reducing scheduled kitchen staff during known equipment downtime periods.

### 5.5 Inventory-Driven Staffing
**Tables:** `FACT_INVENTORY_TRANSACTION`, `FACT_INVENTORY_CONSUMPTION`, `DIM_SUPPLY_ITEM`  
**Feature idea:** If inventory for key items is low (approaching reorder point), flag it in the dashboard "Needs Attention" list alongside scheduling conflicts: "Buns inventory below par — may need to shorten evening service." Connect `DIM_SUPPLY_ITEM.REORDER_POINT` with current `QUANTITY_AFTER` from `FACT_INVENTORY_TRANSACTION` to trigger proactive alerts in the manager dashboard.

### 5.6 Promotion-Based Staffing Bursts
**Tables:** `DIM_PROMOTION`, `FACT_SALES_LINE`  
**Feature idea:** When a promotion is active (`DIM_PROMOTION.EFFECTIVE_FROM_DATE` / `EFFECTIVE_TO_DATE` overlaps the scheduled week), show a staffing recommendation: "Happy Hour 3-5 PM runs Fri-Sun this week — based on past promotion data, order volume increases 40%. Consider adding 2 staff for that window." Pull `FACT_SALES_LINE` grouped by promo period to calibrate the estimate.

### 5.7 Multi-Brand / Multi-Location Manager View
**Tables:** `DIM_BRAND`, `DIM_LOCATION`  
**Feature idea:** `DIM_BRAND` supports a brand hierarchy (`PARENT_BRAND_KEY` self-reference) — ideal for franchise groups that own multiple brands. A "Group manager" role in `APP_USER_ACCOUNTS` (new role: 'GROUP_MANAGER') could see an aggregate view across all their `DIM_LOCATION` rows (filtered by `BRAND_KEY`), comparing weekly labor cost, attendance rate, and open shifts across their entire portfolio of stores.

### 5.8 Sales Channel vs. Labor Allocation
**Tables:** `DIM_SALES_CHANNEL`, `FACT_SALES`, `FACT_STORE_METRICS`  
**Feature idea:** `FACT_STORE_METRICS` tracks `ONLINE_ORDER_COUNT`, `OFFLINE_ORDER_COUNT`, `DRIVE_THRU_ORDER_COUNT`, `DELIVERY_ORDER_COUNT`. Add a Schedule page insight: "58% of orders are drive-thru on weekends — allocate at least 3 staff to drive-thru lane on Sat/Sun." Managers can use this as a template for building their weekly roster.

### 5.9 Supplier Delivery ↔ Staff Scheduling
**Tables:** `FACT_PURCHASE_ORDER`, `DIM_SUPPLIER`  
**Feature idea:** Show pending `FACT_PURCHASE_ORDER` deliveries (`EXPECTED_DELIVERY_DATE`, `DELIVERY_STATUS`) in the shift scheduling context: "Produce delivery from US Foods expected Tuesday 6-9 AM — ensure 1 kitchen staff is assigned for receiving." A "Receiving shift" shift type (from `DIM_SHIFT`) could be auto-suggested when a PO delivery is expected.

### 5.10 ETL Health Monitor in Audit Log
**Tables:** `MAINETLRUNDTL`, `SUBETLRUNDTL`, `MAINETLCONFG`  
**Feature idea:** Expose a read-only ETL health dashboard inside `/settings/audit-log` (new sub-tab "System health") showing the status of key ETL jobs (shift data sync, employee sync, sales sync) using `MAINETLRUNDTL.ETLRUNSTATTYPECODE` and `ETLERRMSG`. When `PAR_GETSHIFTS_STG` hasn't refreshed in 2+ hours, show a warning: "Clock-in data sync delayed — attendance may be stale." This closes the loop for managers who need to trust that the attendance data shown is current.

---

## 6. Summary Table

| Table | Status | App Feature |
|---|---|---|
| `APP_USER_ACCOUNTS` | ✅ Used | Authentication & role-based access |
| `DIM_EMPLOYEE_CURATED` | ✅ Used | People page, schedule grid, profile drawer |
| `DIM_LOCATION` | ✅ Used | Location settings, shift assignment, GPS clock-in |
| `STORE_MANUAL_LABOR_HOURS` | ✅ Used | Schedule grid (write) — the core CRUD table |
| `STORE_MANUAL_LABOR_WEEKLY_SUMMARY` | ✅ Used | Reports KPIs, weekly cost rollup |
| `FACT_LABOR_HOURS` | ✅ Used | Attendance page, reports department breakdown |
| `STORE_MANUAL_EXPENSES` | ✅ Used | Reports (expense tracking) |
| `DIM_SHIFT` | ✅ Used | Shift templates, Create Shift drawer |
| `DIM_DATE` | ✅ Used | All date-based Snowflake joins |
| `DIM_EMPLOYEE` | 🔶 Indirect | ETL source for DIM_EMPLOYEE_CURATED |
| `PAR_GETSHIFTS_STG` | 🔶 Indirect | ETL source for FACT_LABOR_HOURS |
| `PAR_GETEMPLOYEES_STG` | 🔶 Indirect | ETL source for DIM_EMPLOYEE_CURATED |
| `FACT_STORE_METRICS` | 🔶 Indirect | Reports (future enhancement) |
| `DIM_BRAND` | 🔶 Indirect | Multi-brand context (joins only) |
| `FACT_SALES` | ❌ Not used | Sales analytics — future: labor efficiency |
| `FACT_SALES_LINE` | ❌ Not used | Sales analytics — future: promo staffing |
| `DIM_PRODUCT` / `DIM_PRODUCT_BOM` etc. | ❌ Not used | Menu/product management |
| `DIM_CUSTOMER` / `FACT_CUSTOMER_ACTIVITY` | ❌ Not used | CRM — future: CSAT vs staffing |
| `FACT_PURCHASE_ORDER` / `FACT_PURCHASE_ORDER_LINE` | ❌ Not used | Supply chain — future: delivery scheduling |
| `DIM_SUPPLY_ITEM` / `FACT_INVENTORY_*` | ❌ Not used | Inventory — future: inventory-driven staffing |
| `FACT_EQUIPMENT_MAINTENANCE` | ❌ Not used | Maintenance — future: downtime alerts |
| `FACT_EXPENSES` / `DIM_EXPENSE_CATEGORY` | ❌ Not used | Finance — future: P&L in reports |
| `DIM_PROMOTION` / `DIM_SALES_CHANNEL` | ❌ Not used | Marketing — future: promo-based staffing |
| `DIM_PAYMENT_METHOD` | ❌ Not used | POS config — no use in scheduling |
| `DIM_WEATHER` | ❌ Not used | Future: weather-aware staffing suggestions |
| `APP_USER_ACCOUNTS_REPORTS` | ❌ Not used | PowerBI embed — Nexora has native reports |
| `SOFO_*` (all) | ❌ Not used | Supplier order staging — supply chain |
| `PAR_GET*` (unflattened) | ❌ Not used | ETL raw landing zones |
| `MAINETL*` / `SUBETLRUNDTL` / `MSTRETLLST` | ❌ Not used | ETL infrastructure — future: health monitor |
| `REF_PAR_TENDER_CONFIG` | ❌ Not used | POS tender reference |
| `API_CONTROL` | ❌ Not used | ETL API registry |
| Backup / temp tables | ❌ Not used | Dev/ETL artifacts |
