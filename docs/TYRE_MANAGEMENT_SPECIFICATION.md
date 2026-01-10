# Tyre Management Module - Specification

## Overview
The Tyre Management Module provides comprehensive tracking and management of tyre inventory, lifecycle, maintenance, and performance across the entire fleet.

---

## Pages & Functionality

### 1. **Tyre Dashboard** (`/tyres`)
**Purpose:** Central overview of tyre operations and key metrics

**Features:**
- **Summary Cards:**
  - Total tyres in inventory
  - Tyres in use vs. in storage
  - Tyres requiring inspection
  - Tyres below minimum tread depth
  - Average tyre lifespan
  - Cost per kilometer

- **Quick Stats:**
  - Tyres by status (Active, Storage, Maintenance, Disposed)
  - Tyres by brand/type distribution
  - Monthly expenditure trend

- **Alerts & Notifications:**
  - Tyres due for inspection
  - Low tread depth warnings
  - Overdue rotations
  - Tyres approaching retirement

- **Quick Actions:**
  - Add New Tyre
  - Schedule Inspection
  - Record Rotation
  - Generate Reports

**User Actions:**
- View overview metrics
- Click through to detailed views
- Navigate to specific tyre records
- Access quick action buttons

---

### 2. **Tyre Inventory** (`/tyres/inventory`)
**Purpose:** Complete listing and management of all tyres

**Features:**
- **Advanced Data Table:**
  - Tyre ID/Serial Number
  - Brand & Model
  - Size & Specifications
  - Status (In Use, Storage, Maintenance, Disposed)
  - Current Location (Vehicle ID + Position, or Warehouse)
  - Purchase Date & Cost
  - Current Tread Depth
  - Total Mileage/KM
  - Condition Rating

- **Filtering & Search:**
  - Filter by status, brand, size, location
  - Search by serial number or vehicle
  - Sort by any column
  - Save custom filter views

- **Bulk Actions:**
  - Export to Excel/PDF
  - Bulk status updates
  - Generate QR codes for multiple tyres

- **Action Buttons per Row:**
  - View Details
  - Edit Information
  - Assign to Vehicle
  - Schedule Inspection
  - Record Maintenance
  - Mark for Disposal

**User Journey:**
1. User views complete tyre inventory
2. Applies filters to find specific tyres
3. Reviews tyre status and metrics
4. Takes actions on selected tyres

---

### 3. **Add New Tyre** (`/tyres/inventory/add`)
**Purpose:** Register new tyres into the system

**Form Fields:**
- **Basic Information:**
  - Serial Number (auto-generate option)
  - Brand
  - Model
  - Type (All-Season, Summer, Winter, All-Terrain, etc.)
  
- **Specifications:**
  - Size (Width/Aspect Ratio/Diameter)
  - Load Index
  - Speed Rating
  - Tread Pattern
  
- **Purchase Details:**
  - Supplier
  - Purchase Date
  - Purchase Order Number
  - Unit Cost
  - Quantity (for bulk entry)
  - Warranty Period

- **Initial Status:**
  - Status (New - In Storage)
  - Warehouse Location
  - Initial Tread Depth

- **Optional:**
  - Upload photos
  - Attach purchase invoice
  - Add notes

**Features:**
- QR Code generation upon creation
- Bulk import from CSV
- Duplicate entry with modifications
- Save as draft

**User Journey:**
1. User clicks "Add New Tyre"
2. Fills in tyre specifications
3. Enters purchase information
4. System generates unique ID and QR code
5. Tyre added to inventory with "In Storage" status

---

### 4. **Tyre Details** (`/tyres/[id]`)
**Purpose:** Comprehensive view of individual tyre history and data

**Sections:**

**A. Overview Card:**
- Serial Number with QR code
- Brand, Model, Size
- Current Status badge
- Current Location (Vehicle + Position or Warehouse)
- Quick action buttons

**B. Current Metrics:**
- Current Tread Depth (with visual gauge)
- Total Mileage/KM
- Age (months in service)
- Expected Remaining Life
- Condition Rating (1-5 stars)

**C. Assignment History:**
- Timeline of all vehicle assignments
- Position on each vehicle
- Date ranges
- Mileage when assigned/removed

**D. Inspection History:**
- All inspection records
- Tread depth trend chart
- Pressure readings
- Condition notes
- Photos from inspections

**E. Maintenance History:**
- Rotations (date, from/to position, mileage)
- Repairs (type, cost, date)
- Retreading records
- Balancing/Alignment

**F. Financial Summary:**
- Purchase cost
- Total maintenance cost
- Cost per kilometer
- Current value (if applicable)

**G. Documents & Photos:**
- Purchase invoice
- Warranty documents
- Inspection photos
- Damage photos

**Action Buttons:**
- Edit Tyre Info
- Assign to Vehicle
- Remove from Vehicle
- Schedule Inspection
- Record Rotation
- Record Repair
- Mark for Disposal
- Print History Report
- Export Data

**User Journey:**
1. User clicks on tyre from inventory
2. Reviews complete tyre history
3. Analyzes performance metrics
4. Takes necessary action (inspection, maintenance, etc.)

---

### 5. **Assign/Install Tyre** (`/tyres/[id]/assign`)
**Purpose:** Assign tyre to a vehicle and position

**Form Fields:**
- **Vehicle Selection:**
  - Search/Select vehicle
  - View current tyre configuration

- **Position Selection:**
  - Dropdown/list of available positions
  - Select position (Front Left, Front Right, Rear Left, Rear Right, Spare, etc.)
  - For trucks: show all axle positions in dropdown

- **Installation Details:**
  - Installation Date
  - Current Vehicle Odometer
  - Tread Depth at Installation
  - Installed By (technician)
  
- **Remove Existing Tyre:**
  - If position occupied, select disposition:
    - Move to storage
    - Move to different vehicle
    - Mark for disposal
  - Record removal reason

- **Installation Notes:**
  - Any observations
  - Upload photos

**Features:**
- Dropdown selection for position assignment
- Automatic validation (size compatibility)
- Warning if tyre doesn't match vehicle requirements
- Option to schedule rotation reminder

**User Journey:**
1. User selects tyre to assign
2. Chooses vehicle and position
3. Records installation details
4. If replacing existing tyre, handles old tyre
5. System updates both tyre and vehicle records

---

### 6. **Tyre Inspections** (`/tyres/inspections`)
**Purpose:** Schedule, conduct, and track tyre inspections

**Features:**

**A. Inspection Schedule View:**
- Calendar view of scheduled inspections
- List of overdue inspections
- Vehicles requiring inspection
- Filter by vehicle, due date, status

**B. Create Inspection Schedule:**
- Select vehicle(s)
- Set frequency (days or mileage-based)
- Assign inspector
- Set reminder alerts

**C. Inspection List:**
- All past and scheduled inspections
- Filter by date, vehicle, inspector
- Status indicators
- Quick access to inspection forms

**Action Buttons:**
- Schedule New Inspection
- Conduct Inspection
- View Inspection Details
- Generate Inspection Report

**User Journey:**
1. User views inspection schedule
2. Sees overdue/upcoming inspections
3. Conducts inspections as needed
4. Reviews inspection history

---

### 7. **Conduct Inspection** (`/tyres/inspections/[id]` or `/tyres/inspections/create`)
**Purpose:** Record detailed tyre inspection data

**Form Layout:**

**Vehicle & Date Info:**
- Vehicle Selection
- Inspection Date
- Current Odometer
- Inspector Name

**Per-Tyre Inspection (for each position):**

List of all tyre positions with current tyre assignments, select each to inspect:

**For Each Tyre:**
- Tyre ID (auto-populate from assignment)
- Position (pre-filled)

**Measurements:**
- Tread Depth (multiple points - inner, center, outer)
- Visual tread depth indicator
- Pressure (PSI)
- Recommended pressure

**Visual Inspection:**
- Overall Condition (Good, Fair, Poor)
- Damage Types (checkboxes):
  - Cuts/Punctures
  - Cracks
  - Bulges
  - Uneven Wear
  - Sidewall Damage
  - Foreign Objects
- Severity (Minor, Moderate, Severe)

**Actions Required:**
- Pass/Fail status
- Recommended Action (Continue Use, Repair, Rotate, Replace)
- Urgency (Immediate, Within Week, Next Service)

**Photos:**
- Upload photos per tyre
- Capture damage or wear patterns

**Overall Notes:**
- General observations
- Inspector signature

**Auto-Calculations:**
- Remaining tread life percentage
- Pass/fail based on minimum thresholds
- Alert generation for critical issues

**User Journey:**
1. Inspector selects vehicle for inspection
2. Goes through each tyre position
3. Records measurements and observations
4. Takes photos of issues
5. System generates alerts for critical findings
6. Inspection saved with timestamp and signature

---

### 8. **Tyre Rotation** (`/tyres/rotation`)
**Purpose:** Record and schedule tyre rotations

**Features:**

**A. Rotation Schedule:**
- List of vehicles due for rotation
- Rotation intervals (by mileage or time)
- Last rotation date per vehicle
- Next due date

**B. Record Rotation:**

**Vehicle Selection:**
- Choose vehicle
- Load current tyre configuration

**Rotation Planner:**
- Select rotation pattern from dropdown:
  - Front-to-back
  - Cross pattern
  - Rearward cross
  - Custom pattern
- Before/After position tables showing tyre movements

**Rotation Details:**
- Rotation Date
- Current Odometer
- Rotation Pattern Used
- Performed By (technician)
- Next Rotation Due (auto-calculate)

**Per-Tyre Updates:**
- New position for each tyre
- Tread depth at rotation
- Any observations

**Notes:**
- Reason for rotation
- Any issues noted
- Photos (optional)

**Automatic Updates:**
- Update tyre positions in system
- Schedule next rotation
- Update vehicle maintenance records

**User Journey:**
1. User reviews vehicles due for rotation
2. Selects vehicle for rotation
3. Uses visual tool to plan rotation pattern
4. Records rotation details
5. System updates all tyre positions and schedules next rotation

---

### 9. **Tyre Maintenance** (`/tyres/maintenance`)
**Purpose:** Record repairs, retreading, and other maintenance

**Features:**

**A. Maintenance Records List:**
- All maintenance events
- Filter by type, date, tyre, vehicle
- Cost tracking
- Status (Scheduled, In Progress, Completed)

**B. Record Maintenance:**

**Select Tyre:**
- Search by tyre ID or vehicle

**Maintenance Type:**
- Repair (Puncture, Sidewall, etc.)
- Retreading
- Balancing
- Valve Replacement
- Other

**Details:**
- Maintenance Date
- Issue Description
- Work Performed
- Parts Replaced
- Labor Hours
- Service Provider (internal/external)

**Cost Information:**
- Parts Cost
- Labor Cost
- Total Cost

**Status Updates:**
- Before/After tread depth
- Before/After photos
- Test results (balance, pressure test)

**Outcome:**
- Tyre Status (Returned to Service, Needs More Work, Disposed)
- Warranty Claim (if applicable)
- Next inspection date

**User Journey:**
1. User identifies tyre needing maintenance
2. Records maintenance type and details
3. Documents work performed
4. Enters costs
5. Updates tyre status
6. System tracks maintenance history and costs

---

### 10. **Tyre Disposal** (`/tyres/disposal`)
**Purpose:** Manage end-of-life tyre disposal process

**Features:**

**A. Disposal Queue:**
- Tyres marked for disposal
- Reason for disposal
- Disposal status (Pending, Scheduled, Completed)
- Financial summary

**B. Mark for Disposal:**

**Select Tyre:**
- Search/scan tyre

**Disposal Information:**
- Disposal Date
- Disposal Reason:
  - Worn Beyond Limit
  - Irreparable Damage
  - Age/Deterioration
  - Failed Inspection
  - Recalled
  - Other

**Final Metrics:**
- Final Tread Depth
- Total Mileage Achieved
- Months in Service
- Number of Rotations
- Total Maintenance Cost

**Photos:**
- Final condition photos

**Disposal Method:**
- Recycling
- Waste Disposal
- Returned to Supplier
- Sold as Scrap

**Financial:**
- Scrap Value (if any)
- Disposal Cost

**Environmental Compliance:**
- Disposal Certificate Number
- Recycling Partner
- Compliance Documentation

**User Journey:**
1. Tyre fails inspection or reaches end of life
2. User marks tyre for disposal
3. Records disposal reason and final metrics
4. Schedules disposal
5. Records disposal completion
6. System archives tyre record and updates inventory

---

### 11. **Tyre Reports & Analytics** (`/tyres/reports`)
**Purpose:** Generate insights and reports on tyre performance

**Report Types:**

**A. Performance Reports:**
- Average tyre lifespan by brand/model
- Cost per kilometer analysis
- Tyre failure analysis
- Best performing tyres
- Worst performing tyres

**B. Financial Reports:**
- Total tyre expenditure (period)
- Cost breakdown (purchase, maintenance, disposal)
- Budget vs. actual
- Cost by vehicle or fleet segment
- Supplier performance

**C. Maintenance Reports:**
- Inspection compliance rate
- Overdue inspections
- Rotation adherence
- Common maintenance issues
- Maintenance costs

**D. Inventory Reports:**
- Current inventory value
- Stock levels by type/size
- Reorder recommendations
- Slow-moving inventory
- Tyre utilization rate

**E. Compliance Reports:**
- Inspection compliance
- Tyres below safety threshold
- Disposal records
- Warranty claims

**F. Custom Reports:**
- Create custom reports with selected metrics
- Save report templates
- Schedule automated reports

**Features:**
- Interactive charts and graphs
- Export to PDF, Excel, CSV
- Date range selection
- Filter by vehicle, brand, type
- Email scheduling
- Dashboard widgets

**User Journey:**
1. User navigates to reports
2. Selects report type or creates custom report
3. Applies filters and date ranges
4. Reviews visualizations
5. Exports or schedules report

---

### 12. **Tyre Settings** (`/tyres/settings`)
**Purpose:** Configure tyre management parameters and thresholds

**Configuration Options:**

**A. Safety Thresholds:**
- Minimum tread depth (overall)
- Minimum tread depth by vehicle type
- Pressure variance tolerance
- Age-based retirement (years)

**B. Inspection Settings:**
- Default inspection frequency (days/mileage)
- Inspection checklist items
- Pass/fail criteria
- Alert thresholds
- Reminder settings

**C. Rotation Settings:**
- Default rotation intervals
- Rotation patterns by vehicle type
- Auto-scheduling options

**D. Inventory Settings:**
- Reorder point by tyre type
- Preferred suppliers
- QR code format
- ID number format and prefix

**E. Cost Settings:**
- Default disposal cost
- Labor rates
- Budget allocations

**F. Notifications:**
- Email alert recipients
- Alert types enabled
- Notification frequency
- Escalation rules

**G. Integration Settings:**
- Vehicle odometer sync
- Maintenance system integration
- Accounting system sync

**User Journey:**
1. Admin accesses settings
2. Configures safety and operational parameters
3. Sets up alerts and notifications
4. Saves configuration
5. System applies settings across module

---

## Complete User Journeys

### Journey 1: New Tyre Acquisition to Deployment
1. **Purchase & Receipt:** New tyres received from supplier
2. **Add to Inventory:** Staff adds tyres via "Add New Tyre" form
3. **Storage:** Tyres marked as "In Storage" with warehouse location
4. **Assignment Need:** Fleet manager identifies vehicle needing tyres
5. **Assign:** Technician assigns tyres to vehicle positions
6. **Inspection:** Initial inspection recorded
7. **Active Service:** Tyres in use, tracked with vehicle

### Journey 2: Regular Maintenance Cycle
1. **Alert:** System generates inspection due alert
2. **Schedule:** Scheduler assigns inspection to technician
3. **Conduct Inspection:** Technician performs inspection via mobile/tablet
4. **Results:** System evaluates tread depth, pressure, condition
5. **Action:** If rotation needed, scheduled automatically
6. **Rotation:** Technician performs rotation, updates positions
7. **Continue:** Tyres continue in service with updated schedule

### Journey 3: Repair & Maintenance
1. **Issue Identified:** During inspection or incident, damage found
2. **Assessment:** Tyre marked for maintenance
3. **Work Order:** Maintenance scheduled (internal or external)
4. **Repair:** Work performed, details and costs recorded
5. **Testing:** Post-repair inspection
6. **Return to Service:** Tyre reinstalled or returned to inventory
7. **History:** All work logged in tyre record

### Journey 4: End of Life Disposal
1. **Failure Point:** Tyre fails inspection or reaches wear limit
2. **Remove:** Tyre removed from vehicle
3. **Mark for Disposal:** Staff marks for disposal with reason
4. **Documentation:** Final metrics recorded, photos taken
5. **Disposal:** Sent for recycling/disposal
6. **Compliance:** Disposal certificate recorded
7. **Archive:** Tyre record archived with complete history

### Journey 5: Fleet Analysis & Optimization
1. **Review:** Fleet manager reviews monthly performance
2. **Reports:** Generates cost and performance reports
3. **Analysis:** Identifies high-performing and problematic tyres
4. **Decisions:** Adjusts purchasing strategy based on data
5. **Budget:** Updates tyre budget based on trends
6. **Optimization:** Implements changes to improve tyre life

---

## Key Features Across All Pages

### 1. **QR Code Integration**
- Every tyre has a unique QR code
- Mobile scanning for quick access
- Update records via mobile device

### 2. **Mobile Responsiveness**
- All inspection and assignment functions mobile-friendly
- Technicians work from tablets/phones
- Offline mode for field work

### 3. **Alerts & Notifications**
- Real-time alerts for critical issues
- Scheduled reminders
- Email/SMS notifications
- Dashboard notification center

### 4. **Role-Based Access**
- Fleet Manager: Full access, reports, configuration
- Technician: Inspections, maintenance, assignments
- Viewer: Read-only access to reports
- Admin: System configuration

### 5. **Integration Points**
- Vehicle management system
- Maintenance scheduling
- Fuel management (correlate fuel efficiency with tyre condition)
- Accounting system (purchase orders, invoicing)
- GPS tracking (mileage sync)

### 6. **Data Export & Reporting**
- Export capabilities on all major views
- Scheduled report generation
- API for external systems

### 7. **Audit Trail**
- Complete history of all actions
- User tracking for all updates
- Timestamp on all records

---

## Technical Considerations

### Data Models Required:
- Tyre
- TyreInspection
- TyreAssignment
- TyreRotation
- TyreMaintenance
- TyreDisposal
- TyreSpecification
- Supplier
- InspectionSchedule

### Key Relationships:
- Tyre → Vehicle (many-to-one, current assignment)
- Tyre → TyreAssignment (one-to-many, history)
- Tyre → TyreInspection (one-to-many)
- Tyre → TyreMaintenance (one-to-many)
- Vehicle → Tyre (one-to-many, current tyres)

### Performance Considerations:
- Index on tyre serial number, status
- Optimize inspection queries with dates
- Cache dashboard metrics
- Paginate large lists

---

## Success Metrics

1. **Operational:**
   - Inspection compliance rate > 95%
   - Average tyre lifespan improvement
   - Reduction in unexpected tyre failures

2. **Financial:**
   - Reduced cost per kilometer
   - Better budget forecasting
   - Optimized purchasing decisions

3. **Safety:**
   - Zero incidents due to tyre issues
   - 100% of fleet above minimum tread depth
   - Proactive identification of issues

4. **Efficiency:**
   - Reduced time to locate tyre information
   - Faster inspection process
   - Automated scheduling reduces manual work

---

## Future Enhancements

1. **Predictive Analytics:**
   - ML models to predict tyre failures
   - Optimal replacement timing
   - Performance forecasting

2. **IoT Integration:**
   - TPMS (Tire Pressure Monitoring System) integration
   - Real-time pressure and temperature monitoring
   - Automated alerts

3. **Supplier Portal:**
   - Direct ordering integration
   - Warranty claim submission
   - Price comparisons

4. **Mobile App:**
   - Dedicated mobile app for technicians
   - Offline-first architecture
   - Voice notes and photo capture

5. **Advanced Analytics:**
   - Benchmarking against industry standards
   - CO2 impact tracking
   - Route optimization based on tyre condition

---

This comprehensive module ensures complete lifecycle management of tyres, from procurement through disposal, with strong emphasis on safety, cost optimization, and operational efficiency.
