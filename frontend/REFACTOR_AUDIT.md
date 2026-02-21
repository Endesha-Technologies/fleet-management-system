# Fleet Management System — Frontend Refactor Audit

> **Generated:** 2026-02-20  
> **Stack:** Next.js 16, App Router, TypeScript 5, React 19, Tailwind CSS 4  
> **Scope:** Form patterns, component structure, route structure, shared UI, inline types

---

## 1. Summary of Findings

### Critical Issues

| # | Finding | Severity |
|---|---------|----------|
| 1 | **No form library** — No `react-hook-form`, `zod`, or `formik` in `package.json`. Every form is hand-rolled with `useState`. | 🔴 High |
| 2 | **Duplicated `NativeSelect` / `SimpleTextarea` wrappers** — Identical fallback components are copy-pasted across `WorkOrderForm.tsx` and `update-status/page.tsx` despite `Select` and `Textarea` existing in `components/ui/`. | 🔴 High |
| 3 | **Inconsistent form element styling** — Some forms use `<Input>` from `components/ui/`, others use raw `<input>` with bespoke Tailwind classes (e.g. `tyres/inventory/add/page.tsx`). Selects are almost never using the existing `<Select>` component. | 🔴 High |
| 4 | **No validation layer** — Validation is either absent or consists of `alert()` calls and HTML `required` attributes. `WorkOrderForm` uses a `validateStep()` function with `alert()`. | 🔴 High |
| 5 | **Massive page files** — `maintenance/schedule/create/page.tsx` (33.5 kB), `tyres/inventory/add/page.tsx` (25.7 kB), `maintenance/WorkOrderForm.tsx` (31.6 kB) contain entire multi-step forms inline. | 🟠 Medium |
| 6 | **Individual `useState` per field** — `WorkOrderForm.tsx` uses 15+ individual `useState` calls instead of a single form state object. | 🟠 Medium |
| 7 | **Inline types everywhere** — 85+ inline interfaces/types in `components/features/`, 13+ in `app/(dashboard)/` pages. Many are duplicated (e.g. `TyrePosition` in two truck step files). | 🟠 Medium |
| 8 | **No `<form>` tag or submit handler** in some forms — `maintenance/schedule/create` uses button-only navigation without a `<form>` wrapper. | 🟡 Low |
| 9 | **Settings components under `components/settings/`** instead of `components/features/settings/` — inconsistent with the feature folder convention. | 🟡 Low |

### Positive Observations

- Existing `components/ui/` provides a solid shadcn/ui-style primitive layer (Button, Card, Input, Label, Select, Textarea, Checkbox, Sheet, Modal, Tabs, Badge, Table, etc.).
- Domain folder structure under `components/features/` is well-organized.
- The `types/` directory has dedicated type files per domain.
- The `api/` layer is cleanly separated with per-domain service + types modules.
- Multi-step wizard pattern is consistently used (3–7 steps) for complex forms.

---

## 2. Form Element Inventory

### 2.1 Form Element Patterns Found

| Element Pattern | UI Component Used? | Raw HTML Used? | Files (representative) |
|---|---|---|---|
| Text input | `<Input>` from `ui/input` | `<input type="text">` with custom classes | `inventory/add/page.tsx` uses `<Input>`, `tyres/inventory/add/page.tsx` uses raw `<input>` |
| Number input | `<Input type="number">` | `<input type="number">` | `maintenance/schedule/create`, `inventory/add` |
| Select / dropdown | **Rarely** uses `<Select>` from `ui/select` | Raw `<select>` with inline Tailwind | Nearly all forms; `AddAssetDrawer` is one of the few using `<Select>` |
| Textarea | **Rarely** uses `<Textarea>` from `ui/textarea` | Raw `<textarea>` or `SimpleTextarea` wrapper | `maintenance/schedule/create`, `WorkOrderForm`, `update-status/page` |
| Checkbox | **Rarely** uses `<Checkbox>` from `ui/checkbox` | Raw `<input type="checkbox">` | `maintenance/schedule/create`, `TyreInspectionForm` uses `<Checkbox>` |
| Date input | `<Input type="date">` | `<input type="datetime-local">` | `maintenance/schedule/create`, `inventory/add` |
| File upload | None | `<input type="file">` | `WorkOrderForm`, `update-status/page` |
| Radio-style buttons | None | Custom `<button>` grid with active states | `maintenance/schedule/create` (trigger type, priority) |
| Toggle/Switch | None | Checkbox used as toggle | `fuel/settings/page.tsx` |
| Label | `<Label>` from `ui/label` | Raw `<label>` with custom classes | `tyres/inventory/add` uses raw labels; most others use `<Label>` |

### 2.2 Form State Management Patterns

| Pattern | Where Used |
|---|---|
| Single `useState` with object spread `setFormData({...formData, key: value})` | `maintenance/schedule/create`, `fuel/settings`, `AddAssetDrawer` |
| `handleChange` with `e.target.name` dynamic key | `inventory/add`, `tyres/inventory/add`, `inventory/sale`, `inventory/disposal`, `FuelLogForm` |
| Multiple individual `useState` per field | `WorkOrderForm` (15+ calls), `TyreInspectionForm`, `update-status/page` |
| Derived/computed values (inline calculations) | `FuelLogForm.totalCost`, `inventory/add.totalValue`, `WorkOrderForm.calculateTotalCost` |

### 2.3 Validation Patterns

| Pattern | Where Used |
|---|---|
| HTML `required` attribute only | `inventory/add`, `tyres/inventory/add` |
| `validateStep()` with `alert()` | `WorkOrderForm` |
| Manual error state `Record<string, string>` | `CreateRouteDrawer` (only one found) |
| No validation at all | `maintenance/schedule/create`, `fuel/settings`, `inventory/sale`, `inventory/disposal` |

---

## 3. Proposed Reusable Form Components

Based on the patterns found, the following reusable form components should be created in `components/ui/form/`:

### 3.1 Core Form Field Components

| Component | Description | Wraps |
|---|---|---|
| `FormField` | Container providing label, error message, helper text, required indicator | `<Label>` + error display |
| `FormInput` | Text/number/date input with integrated label, error, and helper text | `<Input>` + `FormField` |
| `FormSelect` | Select dropdown with label, placeholder, options, and error | `<Select>` + `FormField` |
| `FormTextarea` | Textarea with label, error, character count | `<Textarea>` + `FormField` |
| `FormCheckbox` | Checkbox with label text inline | `<Checkbox>` + label |
| `FormRadioGroup` | Radio button group (including the card-style variant) | Custom |
| `FormNumberInput` | Number input with optional currency prefix, unit suffix, min/max | `<Input type="number">` + `FormField` |
| `FormDatePicker` | Date/datetime input with label and error | `<Input type="date/datetime-local">` + `FormField` |
| `FormFileUpload` | File upload with drag-and-drop area, preview, multi-file support | Custom |
| `FormToggle` | On/off switch for boolean settings | Custom or Radix Toggle |

### 3.2 Form Layout Components

| Component | Description |
|---|---|
| `FormSection` | Group of form fields with a heading and optional description (replaces repeated `<div className="space-y-4 pb-4 border-b">` + `<h3>` pattern) |
| `FormGrid` | Responsive grid wrapper (1-col mobile, 2-col desktop) — replaces `grid grid-cols-1 sm:grid-cols-2 gap-4` |
| `FormActions` | Standard form action bar (Cancel + Submit buttons) |
| `StepWizard` | Multi-step form orchestrator with progress indicator, step validation, navigation |
| `StepIndicator` | The progress dots/bars used in multi-step forms (duplicated in at least 3 files) |

### 3.3 Suggested Form Library Integration

Install `react-hook-form` + `zod` + `@hookform/resolvers`:
- `react-hook-form` — Performant form state management, eliminates `useState` boilerplate
- `zod` — Schema-based validation, type-safe, composable
- `@hookform/resolvers` — Bridge between zod schemas and react-hook-form

---

## 4. Component Co-location Map

### `components/features/assets/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `AddAssetDrawer` | `inventory/page.tsx` | Keep in features — used from list page |
| `AssetTable` | `inventory/page.tsx` | Keep in features — shared table |
| `AssignAssetDrawer` | `inventory/[id]/page.tsx` | Keep in features — used from detail page |
| `DisposeAssetDrawer` | `inventory/page.tsx`, `inventory/[id]/page.tsx` | Keep in features — used from two routes |
| `LowStockBanner` | `inventory/page.tsx` | Keep in features |
| `PurchaseStockDrawer` | `inventory/page.tsx`, `inventory/[id]/page.tsx` | Keep in features |
| `RemoveAssetDrawer` | `inventory/[id]/page.tsx` | Keep in features |
| `SellAssetDrawer` | `inventory/page.tsx`, `inventory/[id]/page.tsx` | Keep in features |
| `tabs/OverviewTab` | `inventory/[id]/page.tsx` | **Co-locate** to `app/(dashboard)/inventory/[id]/_components/` |
| `tabs/StockUnitsTab` | `inventory/[id]/page.tsx` | **Co-locate** to `app/(dashboard)/inventory/[id]/_components/` |
| `tabs/MovementsTab` | `inventory/[id]/page.tsx` | **Co-locate** to `app/(dashboard)/inventory/[id]/_components/` |
| `tabs/AssignmentsTab` | `inventory/[id]/page.tsx` | **Co-locate** to `app/(dashboard)/inventory/[id]/_components/` |

### `components/features/fuel/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `FuelLogForm` | `fuel/create/page.tsx` | **Co-locate** to `app/(dashboard)/fuel/create/_components/` |
| `FuelTable` | `fuel/page.tsx` | Keep in features — list component |
| `AddFuelLogForm` | Unclear usage (not imported in any page found) | **Investigate** — may be dead code |

### `components/features/maintenance/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `StatCard` | `maintenance/page.tsx` (via barrel) | Keep in features |
| `AlertsCard` | `maintenance/page.tsx` (via barrel) | Keep in features |
| `StatusOverviewCard` | `maintenance/page.tsx` (via barrel) | Keep in features |
| `RecentActivityCard` | `maintenance/page.tsx` (via barrel) | Keep in features |
| `QuickActionsBar` | `maintenance/page.tsx` (via barrel) | Keep in features |
| `WorkOrderTable` | `maintenance/work-orders/page.tsx` | Keep in features |
| `WorkOrderCard` | `maintenance/work-orders/page.tsx` | Keep in features |
| `WorkOrderFilters` | `maintenance/work-orders/page.tsx` | Keep in features |
| `WorkOrderForm` | `maintenance/work-orders/create/page.tsx`, `maintenance/work-orders/[id]/edit/page.tsx` | Keep in features — used from two routes |

### `components/features/routes/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `CreateRouteDrawer` | `routes/page.tsx` | Keep in features |
| `DeleteRouteDialog` | `routes/page.tsx` | Keep in features |
| `EditRouteDrawer` | `routes/page.tsx` | Keep in features |
| `RouteCard` | `routes/page.tsx` | Keep in features |
| `RouteDetails` | `routes/[id]/page.tsx`, `routes/@modal/(.)[id]/page.tsx` | Keep in features |
| `RouteDetailsDrawer` | `routes/page.tsx` | Keep in features |
| `RouteForm` | `routes/create`, `routes/[id]/edit`, `routes/@modal/(.)create`, `routes/@modal/(.)[id]/edit` | Keep in features — widely shared |
| `RouteTable` | `routes/page.tsx` | Keep in features |

### `components/features/trips/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `AssignRouteDrawer` | `trips/page.tsx` | Keep in features |
| `EndTripModal` | Not found in page imports — likely used within `TripDetails` | **Investigate** |
| `FleetTracking` | `trips/tracking/page.tsx` (likely) | Keep in features |
| `StartTripModal` | Not found in page imports — likely used within `TripDetails` | **Investigate** |
| `TrackingMap` | Used by `FleetTracking` | Keep in features |
| `TripDetails` | `trips/[id]/page.tsx`, `trips/@modal/(.)[id]/page.tsx` | Keep in features |
| `TripForm` | `trips/create`, `trips/[id]/edit`, `trips/@modal/(.)create`, `trips/@modal/(.)[id]/edit` | Keep in features |
| `TripFormDrawer` | Not found in page imports | **Investigate** — may be dead code |
| `TripTable` | `trips/page.tsx` | Keep in features |

### `components/features/trucks/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `AddTruckDrawer` | `trucks/page.tsx`, `trucks/[id]/page.tsx` | Keep in features |
| `TruckTable` | `trucks/page.tsx` | Keep in features |
| `steps/BasicIdentityStep` | `AddTruckDrawer` only | **Co-locate** inside `AddTruckDrawer` directory |
| `steps/RegistrationComplianceStep` | `AddTruckDrawer` only | **Co-locate** |
| `steps/TechnicalSpecificationsStep` | `AddTruckDrawer` only | **Co-locate** |
| `steps/AxleTyreConfigStep` | `AddTruckDrawer` only | **Co-locate** |
| `dialogs/TyreAssignmentDialog` | `AddTruckDrawer` only | **Co-locate** |
| `dialogs/AssignLaterDialog` | `AddTruckDrawer` only | **Co-locate** |
| `details/TruckOverview` | `trucks/[id]/page.tsx` | **Co-locate** to `app/(dashboard)/trucks/[id]/_components/` |
| `details/TruckTrips` | `trucks/[id]/page.tsx` | **Co-locate** |
| `details/TruckFuel` | `trucks/[id]/page.tsx` | **Co-locate** |
| `details/TruckTyres` | `trucks/[id]/page.tsx` | **Co-locate** |
| `details/RotateTyresDrawer` | `trucks/[id]/page.tsx` | **Co-locate** |
| `details/ReplaceTyreDrawer` | `trucks/[id]/page.tsx` (likely) | **Co-locate** |
| `details/PostReplacementDialog` | Used by `ReplaceTyreDrawer` | **Co-locate** |

### `components/features/tyres/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `InspectionFilters` | `tyres/inspections/page.tsx` | Keep in features |
| `InspectionScheduleCard` | `tyres/inspections/page.tsx` | Keep in features |
| `InspectionTable` | `tyres/inspections/page.tsx` | Keep in features |
| `RotationForm` | `tyres/rotation/page.tsx` (likely) | Keep in features |
| `RotationHistoryTable` | `tyres/rotation/page.tsx` | Keep in features |
| `RotationScheduleCard` | `tyres/rotation/page.tsx` | Keep in features |
| `TyreInspectionForm` | `tyres/inspections/create/page.tsx` | **Co-locate** to `app/(dashboard)/tyres/inspections/create/_components/` |
| `TyrePositionTracker` | `tyres/[id]/page.tsx` (likely) | Keep in features |

### `components/features/inventory/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `InventoryTable` | `inventory/page.tsx` (likely unused — AssetTable is used instead) | **Investigate** — may be dead code |

### `components/settings/`
| Component | Consumed By Route(s) | Recommend |
|---|---|---|
| `DriversTab` | `settings/drivers/page.tsx` | **Move** to `components/features/settings/` or co-locate |
| `RolesTab` | `settings/roles/page.tsx` | **Move** to `components/features/settings/` |
| `UsersTab` | `settings/users/page.tsx` | **Move** to `components/features/settings/` |

---

## 5. Route-Specific Types Inventory

### 5.1 Inline Types in Page Files

| File | Inline Types | Recommendation |
|---|---|---|
| `maintenance/schedule/create/page.tsx` | `type Step = 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7` | Move to `maintenance/schedule/_types.ts` |
| `maintenance/schedule/[id]/edit/page.tsx` | `type Step = 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7` | Share with create via `maintenance/schedule/_types.ts` |
| `maintenance/schedule/page.tsx` | `type ViewMode`, `type CalendarView` | Move to `maintenance/schedule/_types.ts` |
| `inventory/[id]/move/page.tsx` | `interface PageProps` | Standard Next.js pattern — acceptable inline |
| Multiple `[id]` and `@modal` pages | `interface PageProps { params: Promise<{ id: string }> }` | Could extract a shared `PageProps<T>` utility type |

### 5.2 Inline Types in Feature Components (Non-Props, Should Be Extracted)

| File | Type | Recommendation |
|---|---|---|
| `WorkOrderForm.tsx` | `interface PartItem` | Move to `types/maintenance.ts` |
| `AddTruckDrawer.tsx` | `export interface FormData`, `export type FormStep` | Move to `types/truck.ts` (currently exported but defines truck form shape) |
| `CreateRouteDrawer.tsx` | `interface LocationSuggestion`, `interface RouteFormData` | Move to `types/route.ts` |
| `EditRouteDrawer.tsx` | `interface LocationSuggestion` (duplicate!) | Deduplicate to `types/route.ts` |
| `FuelLogForm.tsx` | `export interface FuelLogFormData` | Move to `types/fuel.ts` |
| `FuelTable.tsx` | `type DateFilterOption` | Move to `types/fuel.ts` |
| `AddAssetDrawer.tsx` | `type AssetType` | Move to `types/asset.ts` |
| `SellAssetDrawer.tsx` | `interface SaleLineItem` | Move to `types/asset.ts` or `types/inventory.ts` |
| `DisposeAssetDrawer.tsx` | `interface DisposeLineItem` | Move to `types/asset.ts` or `types/inventory.ts` |
| `PurchaseStockDrawer.tsx` | `interface LineItem` | Move to `types/asset.ts` |
| `AssignRouteDrawer.tsx` | `interface AssignRouteData` | Move to `types/trip.ts` |
| `FleetTracking.tsx` | `interface TrackingMapProps`, `interface TruckDetailsProps` | Keep `Props` inline, but `TruckDetailsProps` references should use `types/tracking.ts` |
| `TyreAssignmentDialog.tsx` | `interface TyrePosition`, `interface TyreAssignment` | Move to `types/truck.ts` or `types/tyre.ts` |
| `AxleTyreConfigStep.tsx` | `interface TyrePosition` (duplicate!) | Deduplicate to shared type file |
| `RotateTyresDrawer.tsx` | `export type RotationScheme`, `interface RotationItem` | Move to `types/rotation.ts` |
| `ReplaceTyreDrawer.tsx` | `interface ReplacementItem` | Move to `types/tyre.ts` |
| `DriversTab.tsx` | `interface Driver` | Move to `types/driver.ts` (partially exists) |
| `UsersTab.tsx` | `interface User` | Move to `types/user.ts` (doesn't exist yet) |

---

## 6. Recommended Folder Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── @sidebar/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── fuel/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   │       └── FuelLogForm.tsx          ← co-located from features
│   │   │   ├── export/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   ├── add/
│   │   │   │   └── page.tsx
│   │   │   ├── disposal/
│   │   │   ├── history/
│   │   │   ├── sale/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── move/
│   │   │       └── _components/               ← co-located tabs
│   │   │           ├── OverviewTab.tsx
│   │   │           ├── StockUnitsTab.tsx
│   │   │           ├── MovementsTab.tsx
│   │   │           └── AssignmentsTab.tsx
│   │   ├── maintenance/
│   │   │   ├── page.tsx
│   │   │   ├── schedule/
│   │   │   │   ├── _types.ts                  ← shared types for schedule
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │   ├── work-orders/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── edit/
│   │   │   │       ├── print/
│   │   │   │       └── update-status/
│   │   │   ├── service-history/
│   │   │   └── history/
│   │   ├── routes/
│   │   ├── settings/
│   │   │   ├── drivers/
│   │   │   ├── roles/
│   │   │   └── users/
│   │   ├── trips/
│   │   ├── trucks/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── _components/               ← co-located detail tabs
│   │   │           ├── TruckOverview.tsx
│   │   │           ├── TruckTrips.tsx
│   │   │           ├── TruckFuel.tsx
│   │   │           └── TruckTyres.tsx
│   │   ├── tyres/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── assign/
│   │   │   ├── inspections/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── _components/
│   │   │   │   │       └── TyreInspectionForm.tsx
│   │   │   │   └── [id]/
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx
│   │   │   │   └── add/
│   │   │   └── rotation/
│   │   └── users/
├── components/
│   ├── ui/                                    ← primitive layer (keep as-is)
│   │   ├── form/                              ← NEW: reusable form components
│   │   │   ├── FormField.tsx
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   ├── FormCheckbox.tsx
│   │   │   ├── FormRadioGroup.tsx
│   │   │   ├── FormNumberInput.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   ├── FormFileUpload.tsx
│   │   │   ├── FormSection.tsx
│   │   │   ├── FormGrid.tsx
│   │   │   ├── FormActions.tsx
│   │   │   ├── StepWizard.tsx
│   │   │   └── StepIndicator.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── ... (rest of existing primitives)
│   ├── features/                              ← domain components (shared across routes)
│   │   ├── assets/
│   │   │   ├── AddAssetDrawer.tsx
│   │   │   ├── AssetTable.tsx
│   │   │   ├── AssignAssetDrawer.tsx
│   │   │   ├── DisposeAssetDrawer.tsx
│   │   │   ├── LowStockBanner.tsx
│   │   │   ├── PurchaseStockDrawer.tsx
│   │   │   ├── RemoveAssetDrawer.tsx
│   │   │   └── SellAssetDrawer.tsx
│   │   ├── fuel/
│   │   │   └── FuelTable.tsx
│   │   ├── maintenance/
│   │   │   ├── index.ts
│   │   │   ├── AlertsCard.tsx
│   │   │   ├── QuickActionsBar.tsx
│   │   │   ├── RecentActivityCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatusOverviewCard.tsx
│   │   │   ├── WorkOrderCard.tsx
│   │   │   ├── WorkOrderFilters.tsx
│   │   │   ├── WorkOrderForm.tsx
│   │   │   └── WorkOrderTable.tsx
│   │   ├── routes/
│   │   │   ├── CreateRouteDrawer.tsx
│   │   │   ├── DeleteRouteDialog.tsx
│   │   │   ├── EditRouteDrawer.tsx
│   │   │   ├── RouteCard.tsx
│   │   │   ├── RouteDetails.tsx
│   │   │   ├── RouteDetailsDrawer.tsx
│   │   │   ├── RouteForm.tsx
│   │   │   └── RouteTable.tsx
│   │   ├── settings/                          ← MOVED from components/settings/
│   │   │   ├── DriversTab.tsx
│   │   │   ├── RolesTab.tsx
│   │   │   └── UsersTab.tsx
│   │   ├── trips/
│   │   │   ├── AssignRouteDrawer.tsx
│   │   │   ├── FleetTracking.tsx
│   │   │   ├── TrackingMap.tsx
│   │   │   ├── TripDetails.tsx
│   │   │   ├── TripForm.tsx
│   │   │   └── TripTable.tsx
│   │   ├── trucks/
│   │   │   ├── AddTruckDrawer/               ← restructured as directory
│   │   │   │   ├── index.tsx
│   │   │   │   ├── BasicIdentityStep.tsx
│   │   │   │   ├── RegistrationComplianceStep.tsx
│   │   │   │   ├── TechnicalSpecificationsStep.tsx
│   │   │   │   ├── AxleTyreConfigStep.tsx
│   │   │   │   ├── TyreAssignmentDialog.tsx
│   │   │   │   └── AssignLaterDialog.tsx
│   │   │   └── TruckTable.tsx
│   │   └── tyres/
│   │       ├── index.ts
│   │       ├── InspectionFilters.tsx
│   │       ├── InspectionScheduleCard.tsx
│   │       ├── InspectionTable.tsx
│   │       ├── RotationForm.tsx
│   │       ├── RotationHistoryTable.tsx
│   │       ├── RotationScheduleCard.tsx
│   │       └── TyrePositionTracker.tsx
│   └── layout/                                ← keep as-is
│       ├── BottomNav.tsx
│       ├── Header.tsx
│       └── Sidebar.tsx
├── types/                                     ← consolidated type files
│   ├── asset.ts
│   ├── driver.ts
│   ├── fuel.ts
│   ├── inspection.ts
│   ├── inventory.ts
│   ├── maintenance.ts
│   ├── rotation.ts
│   ├── route.ts
│   ├── tracking.ts
│   ├── trip.ts
│   ├── truck.ts
│   ├── tyre.ts
│   ├── user.ts                                ← NEW
│   └── vehicle.ts
├── lib/
│   └── validations/                           ← NEW: zod schemas per domain
│       ├── fuel.ts
│       ├── maintenance.ts
│       ├── inventory.ts
│       ├── truck.ts
│       ├── tyre.ts
│       ├── route.ts
│       ├── trip.ts
│       └── user.ts
├── constants/
│   └── ...                                    ← keep as-is
└── api/
    └── ...                                    ← keep as-is
```

---

## 7. Migration Order

The following order minimizes risk by starting with foundational changes and progressing to domain-specific refactors:

### Phase 1: Foundation
1. Install `react-hook-form`, `zod`, `@hookform/resolvers`
2. Create `components/ui/form/FormField.tsx` — base wrapper with label, error, helper text
3. Create `components/ui/form/FormInput.tsx` — wraps existing `Input`
4. Create `components/ui/form/FormSelect.tsx` — wraps existing `Select`
5. Create `components/ui/form/FormTextarea.tsx` — wraps existing `Textarea`
6. Create `components/ui/form/FormCheckbox.tsx` — wraps existing `Checkbox`
7. Create `components/ui/form/FormNumberInput.tsx`
8. Create `components/ui/form/FormDatePicker.tsx`
9. Create `components/ui/form/FormFileUpload.tsx`
10. Create `components/ui/form/FormRadioGroup.tsx`
11. Create `components/ui/form/FormSection.tsx` and `FormGrid.tsx`
12. Create `components/ui/form/FormActions.tsx`
13. Create `components/ui/form/StepWizard.tsx` and `StepIndicator.tsx`

### Phase 2: Type Extraction
14. Extract duplicated `LocationSuggestion` to `types/route.ts`
15. Extract `TyrePosition` to `types/tyre.ts` (deduplicate from two files)
16. Extract `PartItem`, `LineItem`, `SaleLineItem`, `DisposeLineItem` to respective type files
17. Extract `FuelLogFormData`, `DateFilterOption` to `types/fuel.ts`
18. Extract `FormData`/`FormStep` from `AddTruckDrawer` to `types/truck.ts`
19. Create `types/user.ts` from `UsersTab` inline `User` interface
20. Create `maintenance/schedule/_types.ts` for `Step`, `ViewMode`, `CalendarView`
21. Create zod schemas in `lib/validations/` for each domain

### Phase 3: Simplest Forms First (Inventory Domain)
22. Refactor `inventory/add/page.tsx` — replace raw selects/textarea with form components + zod validation
23. Refactor `inventory/sale/page.tsx` — same treatment
24. Refactor `inventory/disposal/page.tsx` — same treatment
25. Co-locate asset detail tabs to `inventory/[id]/_components/`

### Phase 4: Fuel Domain
26. Refactor `FuelLogForm.tsx` to use `react-hook-form` + zod
27. Co-locate `FuelLogForm` to `fuel/create/_components/`
28. Refactor `fuel/settings/page.tsx` — replace inline form with form components
29. Investigate and remove `AddFuelLogForm.tsx` if dead code

### Phase 5: Maintenance Domain
30. Refactor `WorkOrderForm.tsx` — consolidate 15+ `useState` into `react-hook-form`, use form components, add zod validation
31. Remove duplicated `NativeSelect`/`SimpleTextarea` from `WorkOrderForm.tsx` and `update-status/page.tsx`
32. Refactor `maintenance/schedule/create/page.tsx` — extract step components, use `StepWizard`
33. Refactor `maintenance/schedule/[id]/edit/page.tsx` — share step components with create
34. Refactor `maintenance/work-orders/[id]/update-status/page.tsx`

### Phase 6: Tyres Domain
35. Refactor `tyres/inventory/add/page.tsx` — replace raw HTML inputs with form components, add zod validation
36. Refactor `TyreInspectionForm.tsx` — consolidate `useState`, use form components
37. Co-locate `TyreInspectionForm` to `tyres/inspections/create/_components/`

### Phase 7: Trucks Domain
38. Restructure `AddTruckDrawer` as a directory with co-located steps and dialogs
39. Co-locate truck detail components to `trucks/[id]/_components/`
40. Refactor truck form steps to use form components

### Phase 8: Routes & Trips
41. Refactor `CreateRouteDrawer` and `EditRouteDrawer` — deduplicate `LocationSuggestion`, use form components
42. Refactor `TripForm` and `AssignRouteDrawer`
43. Investigate and remove `TripFormDrawer` if dead code

### Phase 9: Settings Domain
44. Move `components/settings/` to `components/features/settings/`
45. Refactor `DriversTab`, `UsersTab`, `RolesTab` — use form components and zod validation
46. Extract inline `Driver`/`User` interfaces to type files

### Phase 10: Cleanup
47. Remove all `NativeSelect`/`SimpleTextarea` duplicates
48. Remove dead code (`AddFuelLogForm`, `TripFormDrawer`, `InventoryTable` if confirmed unused)
49. Add barrel exports for `components/ui/form/`
50. Update all imports throughout the codebase

---

## Appendix: Potential Dead Code

| File | Reason |
|---|---|
| `components/features/fuel/AddFuelLogForm.tsx` | Not imported by any page (only `FuelLogForm.tsx` is imported) |
| `components/features/trips/TripFormDrawer.tsx` | Not imported by any page |
| `components/features/inventory/InventoryTable.tsx` | `inventory/page.tsx` imports `AssetTable` instead |
