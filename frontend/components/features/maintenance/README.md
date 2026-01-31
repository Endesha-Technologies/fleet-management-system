# Maintenance Dashboard Implementation

## Overview
The Maintenance Dashboard provides a comprehensive, mobile-first interface for monitoring and managing vehicle maintenance activities across the fleet.

## Architecture

### Component Structure
```
components/features/maintenance/
├── StatCard.tsx              # Reusable metric cards with icons
├── AlertsCard.tsx            # Alert notifications display
├── StatusOverviewCard.tsx    # Status breakdown with progress bars
├── RecentActivityCard.tsx    # Timeline of recent activities
├── QuickActionsBar.tsx       # Quick access buttons
└── index.ts                  # Barrel export
```

### Data Flow
```
constants/maintenance.ts (Mock Data)
        ↓
app/(dashboard)/maintenance/page.tsx (Page Component)
        ↓
Individual Feature Components
```

## Mobile-First Design Principles

### 1. **Responsive Grid System**
- **Mobile (< 640px)**: Single column layout
- **Tablet (640px - 1024px)**: 2-column grid
- **Desktop (> 1024px)**: 3-4 column grid

```tsx
// Example responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

### 2. **Touch-Optimized Interactions**
- **Large tap targets**: Minimum 44x44 points (iOS) / 48x48 dp (Android)
- **Adequate spacing**: 12-16px between interactive elements
- **Hover states**: Subtle on mobile, more prominent on desktop

```tsx
// Touch-friendly button sizing
<Button className="w-full h-auto py-4 flex-col gap-2">
  <Icon className="h-6 w-6" />
  <span className="text-xs">Label</span>
</Button>
```

### 3. **Progressive Disclosure**
- Show essential information first
- Expandable sections for details
- Scrollable containers with max heights
- "View all" links for full data access

```tsx
<div className="max-h-[400px] overflow-y-auto">
  {/* Content */}
</div>
```

### 4. **Typography Scaling**
- Mobile: Smaller text (text-xs, text-sm)
- Tablet/Desktop: Larger text (text-sm, text-base)

```tsx
<p className="text-xs sm:text-sm">Responsive text</p>
```

### 5. **Icon Sizing**
- Mobile: 4-5 (16-20px)
- Desktop: 5-6 (20-24px)

```tsx
<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
```

## Component Details

### StatCard
**Purpose**: Display key performance metrics with visual indicators

**Props**:
- `title`: Metric name
- `value`: Current value (string | number)
- `subtitle`: Additional context
- `icon`: Lucide icon component
- `trend`: Optional trend indicator
- `iconColor`: Icon color class
- `iconBgColor`: Icon background color class

**Mobile Optimizations**:
- Flexible layout that stacks on small screens
- Truncated text with ellipsis
- Relative sizing (text-xl sm:text-2xl md:text-3xl)

**Usage**:
```tsx
<StatCard
  title="Active Work Orders"
  value={24}
  subtitle="Currently being processed"
  icon={Wrench}
  iconColor="text-blue-600"
  iconBgColor="bg-blue-100"
/>
```

### AlertsCard
**Purpose**: Display system alerts and notifications with severity indicators

**Features**:
- Color-coded severity (critical, warning, info)
- Type-specific icons
- Time-ago timestamps
- Badge counters for critical/warning counts
- Scrollable list with max height

**Mobile Optimizations**:
- Smaller padding on mobile (p-3 sm:p-4)
- Reduced icon sizes on mobile
- Compact layout with smart wrapping

**Severity Styling**:
- **Critical**: Red (bg-red-50, border-l-red-500)
- **Warning**: Amber (bg-amber-50, border-l-amber-500)
- **Info**: Blue (bg-blue-50, border-l-blue-500)

### StatusOverviewCard
**Purpose**: Visualize status distributions with progress bars

**Features**:
- Horizontal progress bars
- Percentage calculations
- Color-coded categories
- Total summary

**Mobile Optimizations**:
- Stacked bars (full width)
- Percentage display below each bar
- Reduced spacing on mobile

**Usage**:
```tsx
<StatusOverviewCard
  title="Vehicle Status"
  data={[
    { label: 'Operational', value: 82, bgColor: 'bg-green-500' },
    { label: 'In Workshop', value: 5, bgColor: 'bg-blue-500' },
  ]}
  total={105}
/>
```

### RecentActivityCard
**Purpose**: Display chronological activity timeline

**Features**:
- Activity type icons
- Color-coded activities
- Time-ago timestamps
- Work order and vehicle references
- Scrollable timeline

**Mobile Optimizations**:
- Inline icons on mobile (hidden timeline line)
- Vertical timeline on desktop
- Compact spacing
- Truncated text

**Activity Types**:
- `work-order-completed`: Green (CheckCircle2)
- `work-order-created`: Blue (FileText)
- `breakdown-reported`: Red (AlertTriangle)
- `service-started`: Amber (Wrench)

### QuickActionsBar
**Purpose**: Provide quick access to common actions

**Mobile Optimizations**:
- **Mobile**: 2-column grid with large square buttons
- **Desktop**: Horizontal button row with icons and text

```tsx
// Mobile: Large touch targets
<div className="grid grid-cols-2 gap-3 md:hidden">
  <Button className="w-full h-auto py-4 flex-col gap-2">
    <Icon className="h-6 w-6" />
    <span className="text-xs">Label</span>
  </Button>
</div>

// Desktop: Horizontal layout
<div className="hidden md:flex gap-3">
  <Button className="gap-2">
    <Icon className="h-4 w-4" />
    Label
  </Button>
</div>
```

## Responsive Breakpoints

Following Tailwind's default breakpoints:
- **sm**: 640px (tablet portrait)
- **md**: 768px (tablet landscape)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

## Color System

### Status Colors
- **Success/Operational**: Green (green-600, green-100)
- **Warning/Due**: Amber (amber-600, amber-100)
- **Info/In Progress**: Blue (blue-600, blue-100)
- **Danger/Critical**: Red (red-600, red-100)
- **Neutral/Pending**: Gray (gray-600, gray-100)

### Component Colors
- **Background**: bg-card (white in light mode)
- **Text**: text-foreground, text-muted-foreground
- **Borders**: border, border-muted
- **Accents**: bg-accent/50 for hover states

## Performance Considerations

### 1. **Code Splitting**
- Components are lazy-loaded via Next.js dynamic imports
- Client components marked with 'use client'

### 2. **Rendering Optimization**
- Use React.memo for expensive components
- Avoid inline functions in render
- Use CSS for animations, not JavaScript

### 3. **Data Optimization**
- Mock data structure mirrors production API
- Easy to replace with real API calls
- Pagination ready (max-h with overflow)

## Accessibility

### 1. **Semantic HTML**
- Proper heading hierarchy (h1, h2, h3)
- Semantic tags (nav, main, section)
- ARIA labels where needed

### 2. **Keyboard Navigation**
- All interactive elements keyboard accessible
- Focus states visible
- Tab order logical

### 3. **Screen Readers**
- Alt text for icons
- ARIA labels for icon-only buttons
- Status announcements

### 4. **Color Contrast**
- WCAG AA compliant
- 4.5:1 minimum contrast ratio
- Not relying solely on color for information

## Future Enhancements

### Phase 2
- [ ] Pull-to-refresh on mobile
- [ ] Skeleton loading states
- [ ] Empty states with illustrations
- [ ] Error boundaries with retry
- [ ] Real-time updates via WebSocket
- [ ] Offline support with service workers

### Phase 3
- [ ] Advanced filtering
- [ ] Custom dashboard layouts
- [ ] Export functionality
- [ ] Print-friendly views
- [ ] Dark mode support
- [ ] Multi-language support

## Testing Checklist

### Mobile (< 640px)
- [ ] All content visible without horizontal scroll
- [ ] Touch targets minimum 44x44 points
- [ ] Text readable without zoom
- [ ] Cards stack vertically
- [ ] Quick actions in 2x2 grid
- [ ] Bottom spacing for navigation

### Tablet (640px - 1024px)
- [ ] 2-column layouts render correctly
- [ ] Status cards side-by-side
- [ ] No awkward spacing
- [ ] Hover states work on touch

### Desktop (> 1024px)
- [ ] Full 4-column stat grid
- [ ] 3-column main layout (2:1 ratio)
- [ ] All hover states visible
- [ ] No wasted whitespace

## Integration Guide

### Replacing Mock Data with Real API

1. **Create API service**:
```tsx
// services/maintenanceService.ts
export async function getMaintenanceDashboard(): Promise<MaintenanceDashboardData> {
  const response = await fetch('/api/maintenance/dashboard');
  return response.json();
}
```

2. **Update page component**:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { getMaintenanceDashboard } from '@/services/maintenanceService';

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceDashboardData | null>(null);
  
  useEffect(() => {
    getMaintenanceDashboard().then(setData);
  }, []);
  
  if (!data) return <LoadingState />;
  
  return (
    // ... dashboard with data
  );
}
```

3. **Add loading and error states**:
```tsx
if (loading) return <DashboardSkeleton />;
if (error) return <ErrorState onRetry={refetch} />;
```

## File Structure Summary

```
app/
└── (dashboard)/
    └── maintenance/
        └── page.tsx                 # Main dashboard page

components/
├── features/
│   └── maintenance/
│       ├── StatCard.tsx
│       ├── AlertsCard.tsx
│       ├── StatusOverviewCard.tsx
│       ├── RecentActivityCard.tsx
│       ├── QuickActionsBar.tsx
│       └── index.ts
└── ui/
    ├── card.tsx
    ├── button.tsx
    └── badge.tsx

types/
└── maintenance.ts                   # TypeScript interfaces

constants/
└── maintenance.ts                   # Mock data
```

## Best Practices Applied

✅ **Mobile-First CSS**: Start with mobile styles, enhance for larger screens  
✅ **Component Composition**: Small, reusable components  
✅ **TypeScript**: Full type safety  
✅ **Consistent Spacing**: Using Tailwind's spacing scale  
✅ **Performance**: Lazy loading, code splitting  
✅ **Accessibility**: Semantic HTML, ARIA labels  
✅ **Maintainability**: Clear file structure, documented code  
✅ **Scalability**: Easy to add new features  

## Browser Support

- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Notes

- All icons from `lucide-react` for consistency
- Tailwind CSS for styling (no custom CSS)
- Next.js 16 with App Router
- React 19 with TypeScript 5
- No external charting libraries (pure CSS visualizations)
