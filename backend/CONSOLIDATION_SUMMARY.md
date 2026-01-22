# Entity Consolidation Summary

## Overview
Applied aggressive consolidation approach to reduce entity count from 49 to 44 entities, eliminating redundancy while maintaining all functional requirements.

## Consolidations Applied

### 1. TyreRotation + TyreRotationDetail → TyrePositionChange
**Rationale:** Header-detail pattern was unnecessary. Each tyre position change is independent.

**Before:**
- `TyreRotation` - Header table with rotation date, truck, performed by
- `TyreRotationDetail` - Individual tyre movements in the rotation

**After:**
- `TyrePositionChange` - Single entity containing:
  - All header info (date, truck, performed by)
  - From position (axle + wheel position)
  - To position (axle + wheel position)
  - Tread depth before/after
  - Individual tyre reference

**Benefits:**
- Simpler queries - no joins needed
- Each position change tracked independently
- Easier to report on individual tyre movement history
- Reduced table count

### 2. Inspection + InspectionItem → Inspection with JSONB
**Rationale:** Inspection items rarely queried independently, always accessed with inspection header.

**Before:**
- `Inspection` - Header with inspection metadata
- `InspectionItem` - Individual checklist items (separate table)

**After:**
- `Inspection` - Single entity with:
  - All header fields
  - `items: InspectionItemData[]` - JSONB array containing:
    - itemSequence
    - category
    - itemName
    - checkResult
    - condition
    - measurement
    - notes
    - requiresAction
    - actionRequired
    - photoUrl

**Benefits:**
- Atomic operations - insert inspection with all items in one transaction
- No joins needed to fetch inspection details
- Better performance for inspection retrieval
- Flexible schema - easy to add new item attributes

### 3. RouteStop → JSON array in Route
**Rationale:** Route stops are static, defined once, rarely modified independently.

**Before:**
- `RouteStop` - Separate table with sequence, location, stop type

**After:**
- `Route.stops: RouteStopData[]` - JSONB array containing:
  - stopSequence
  - locationName
  - locationCoords (optional)
  - stopType
  - estimatedArrivalMinutes
  - plannedStayMinutes
  - notes

**Benefits:**
- Route definition is atomic
- No need to query stops separately
- Route export/import simplified
- Reduced joins when displaying route details

**Note:** `TripStop` remains separate as it tracks actual stops during trips (runtime data).

### 4. DriverCertification → JSON array in Driver
**Rationale:** Certifications are always accessed with driver data, small dataset per driver.

**Before:**
- `DriverCertification` - Separate table with cert type, number, expiry

**After:**
- `Driver.certifications: DriverCertificationData[]` - JSONB array containing:
  - certificationType
  - certificationNumber
  - issueDate
  - expiryDate
  - issuingAuthority
  - documentUrl
  - status (valid/expired/suspended)

**Benefits:**
- Single query to get driver with all certifications
- Simplified driver profile management
- Easy to add new certification types
- No separate table maintenance

### 5. AlertRule recipient optimization
**Rationale:** Multiple simple-array columns were scattered, difficult to manage together.

**Before:**
```typescript
notificationChannels: string[];  // simple-array
recipientRoles: string[];        // simple-array
recipientUsers: string[];        // simple-array
```

**After:**
```typescript
notification: {
  channels: string[];
  recipients: {
    roles?: string[];
    userIds?: string[];
  };
}
```

**Benefits:**
- Single field for all notification configuration
- Better organization and grouping
- Easier to extend (add email templates, SMS settings, etc.)
- Type-safe structure with interfaces

## Trade-offs Considered

### When to Use JSONB vs Separate Table

**Use JSONB when:**
- ✅ Data is always accessed together with parent
- ✅ Child records are rarely queried independently
- ✅ Schema flexibility is valuable
- ✅ Data volume per parent is small (<50 items)
- ✅ No complex joins needed on child data

**Use Separate Table when:**
- ✅ Child records queried independently frequently
- ✅ Need complex filtering/sorting on child data
- ✅ Large volume of child records per parent
- ✅ Need foreign keys to other entities
- ✅ Need to track history/audit trail on child records

### Applied to Consolidations

| Entity Pair | Decision | Reasoning |
|------------|----------|-----------|
| TyreRotation + Detail | **Merge** | Position changes are independent events, not true header-detail |
| Inspection + Item | **Merge to JSONB** | Items always accessed with inspection, checklist nature |
| Route + Stop | **Merge to JSONB** | Stops are static route definition, not runtime data |
| Driver + Certification | **Merge to JSONB** | Small dataset, always shown with driver profile |
| AlertRule recipients | **Optimize to JSONB** | Better organization, single notification config |

## Entities NOT Consolidated

### Kept Separate Despite Similarities

1. **MaintenancePlan + MaintenancePlanTask**
   - Tasks can be complex with many fields
   - Tasks might be reused across plans (future feature)
   - Need independent task management

2. **WorkOrder + WorkOrderTask**
   - Runtime data with progress tracking
   - Need to query tasks independently for reporting
   - Mechanics update individual tasks

3. **Trip + TripStop**
   - Runtime data, stops recorded as they happen
   - Need to query stops for route optimization
   - Large volume of stops per trip possible

4. **Part + PartTransaction**
   - High transaction volume
   - Complex inventory queries needed
   - Audit trail requirements

## Final Entity Count

- **Before:** 49 entities
- **Removed:** 4 entities (TyreRotationDetail, InspectionItem, RouteStop, DriverCertification)
- **Renamed:** 1 entity (TyreRotation → TyrePositionChange)
- **After:** 44 entities

## Migration Strategy

### For Existing Data (if any)

1. **TyreRotation consolidation:**
```sql
-- Migrate TyreRotationDetail data into new TyrePositionChange structure
INSERT INTO tyre_position_changes (
    tyreId, truckId, changeDate, fromAxlePosition, fromWheelPosition,
    toAxlePosition, toWheelPosition, odometerReading, performedBy, ...
)
SELECT 
    trd.tyreId, tr.truckId, tr.rotationDate, 
    trd.oldAxlePosition, trd.oldWheelPosition,
    trd.newAxlePosition, trd.newWheelPosition,
    tr.odometerReading, tr.performedBy, ...
FROM tyre_rotation_details trd
JOIN tyre_rotations tr ON trd.rotationId = tr.id;
```

2. **Inspection consolidation:**
```sql
-- Migrate InspectionItem into Inspection.items JSONB
UPDATE inspections i
SET items = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'itemSequence', ii.itemSequence,
            'category', ii.category,
            'itemName', ii.itemName,
            'checkResult', ii.checkResult,
            ...
        )
        ORDER BY ii.itemSequence
    )
    FROM inspection_items ii
    WHERE ii.inspectionId = i.id
);
```

3. **Route consolidation:**
```sql
-- Migrate RouteStop into Route.stops JSONB
UPDATE routes r
SET stops = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'stopSequence', rs.stopSequence,
            'locationName', rs.locationName,
            'stopType', rs.stopType,
            ...
        )
        ORDER BY rs.stopSequence
    )
    FROM route_stops rs
    WHERE rs.routeId = r.id
);
```

4. **Driver consolidation:**
```sql
-- Migrate DriverCertification into Driver.certifications JSONB
UPDATE drivers d
SET certifications = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'certificationType', dc.certificationType,
            'certificationNumber', dc.certificationNumber,
            'issueDate', dc.issueDate,
            ...
        )
    )
    FROM driver_certifications dc
    WHERE dc.driverId = d.id
);
```

## TypeScript Type Safety

All JSONB fields have TypeScript interfaces for type safety:

```typescript
// Route stops
interface RouteStopData {
    stopSequence: number;
    locationName: string;
    locationCoords?: { latitude: number; longitude: number };
    stopType: StopType;
    estimatedArrivalMinutes?: number;
    plannedStayMinutes?: number;
    notes?: string;
}

// Inspection items
interface InspectionItemData {
    itemSequence?: number;
    category: string;
    itemName: string;
    checkResult: CheckResult;
    condition: ItemCondition;
    measurement?: string;
    notes?: string;
    requiresAction?: boolean;
    actionRequired?: string;
    photoUrl?: string;
}

// Driver certifications
interface DriverCertificationData {
    certificationType: string;
    certificationNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    issuingAuthority?: string;
    documentUrl?: string;
    status: CertificationStatus;
}

// Alert recipients
interface AlertRecipientsData {
    roles?: string[];
    userIds?: string[];
}
```

## Validation

After consolidation, verify:
- ✅ All entity files compile without errors
- ✅ No broken imports in other files
- ✅ JSONB columns have proper interfaces
- ✅ Documentation updated
- ✅ Total entity count: 44

## Next Steps

1. Update any service files that referenced removed entities
2. Create migration files for database schema
3. Update API endpoints if needed
4. Update frontend types to match new structures
5. Add validation for JSONB field structures
