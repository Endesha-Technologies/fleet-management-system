## Fleet Management system

This is a Fleet Management System designed to manage trucks, drivers, routes, trips, maintenance, fuel, tyres, and parts for businesses that operate truck fleets. The system is intended to provide full operational visibility and streamline fleet management processes.


Key capabilities include:

- User and Role Management: Secure access with role-based permissions for admins, fleet managers, drivers, and mechanics.

- Driver Management: Maintain driver profiles, track licenses, assign trips, and monitor performance.

- Truck and Parts Management: Track trucks and spare parts inventory, manage installations, removals, sales, and disposals.

- Route and Trip Management: Plan routes, assign trips, monitor real-time GPS location, and collect trip data.

- Fuel Tracking: Record fuel usage, monitor efficiency, and control fuel stock.

- Tyre Management: Add tyres to inventory, assign to trucks, track position, mileage, rotation, inspections, and lifecycle.

- Maintenance Management: Schedule and log preventive and corrective maintenance, monitor costs, and track truck health.

- Audit Trails: Capture every critical action in the system for accountability and traceability.

### 1. User and Role management

Enable secure access to the fleet management system and ensure that users can only perform actions permitted by their role.

#### Requirements:

- Login and logout functionality
- Password reset and recovery
- Role based access control

    - Modular roles and permissions

- Audit logging
- Driver management

### 2. Truck and parts management

Enable tracking, control, and lifecycle management of all truck parts in the fleet, including inventory, installation, removal, sale, and disposal. The system should support audits and maintain history for traceability.

#### Requirements

1. Parts Inventory Management

    - Add, update, view, and delete parts.

    - Track part details.

    - Categorize parts by type (engine, electrical, tyres, brakes, etc.).

    - Track stock levels with low-stock alerts.

2. Parts Assignment & Lifecycle

    - Assign parts to trucks with installation date and odometer reading.

    - Remove parts from trucks back to inventory, or mark as disposed.

    - Track parts that are sold externally.

    - Support parts replacement and swapping between trucks.

3. History & Tracking

    - Maintain full history of part movements (install, remove, sale, disposal).

    - Track which truck used a part and when.

    - Record odometer/mileage at installation and removal.

4. Maintenance & Inspection Integration

    - Link parts to maintenance logs for tracking wear and replacement schedules.

5. Search, Filters, & Reports

    - Search parts by name, type, status, or truck assignment.

    - Filter parts by warranty status, quantity, or installation date.

6. Audit Trails

    - Log all critical actions including part creation, updates, removal, installation, disposal, and sale.

    - Include timestamp, user, affected truck/part, and action type.

### 3. Route and Trip Management

Enable the creation, assignment, tracking, and monitoring of routes and trips for trucks and drivers. The system should support operational efficiency, real-time tracking, and historical reporting.

#### Requirements

##### Route management

1. Create routes with:

    - Start and end points.

    - Optional intermediate stops.

    - Estimated distance and duration.

    - Route identifier or code.

2. Edit, delete, or deactivate routes.

3. Categorize routes by type (short-haul, long-haul, regional, international).

4. Track routes historically for reporting and planning.

##### Trip Management

1. Create trips linked to:

    - A specific route.

    - A truck.

    - A driver.

    - Scheduled start and end times.

2. Track trip status:

    - Scheduled.

    - In-progress.

    - Completed.

    - Delayed.

    - Cancelled.

3. Edit or cancel trips before departure.

4. Record trip metrics:

    - Actual start and end times.

    - Distance traveled.

    - Average speed.

    - Stops made.

5. Collect GPS data during the trip.

6. Assign multiple drivers/trucks to different trips simultaneously.

7. Generate reports of trip assignments.

##### Integration

1. Link trips with:

    - Fuel logs for consumption tracking.

    - Maintenance module for pre- or post-trip checks.

    - Tyre module for monitoring wear and record mileage during trips.

##### Audit Trails

1. All route/trip creation, modification, cancellation, and assignment actions must be logged.

2. Include user, timestamp, entity type, entity ID, and action description.


### 4. Fuel Tracking
Enable tracking of fuel usage, costs, and efficiency for all trucks in the fleet. The system should allow recording fuel events, linking them to trucks and drivers, and providing insights for cost management and operational efficiency.

#### Requirements

1. Fuel Log Management

    - Record fuel purchases or refills:
    - Support bulk entries for fleet-wide refills.
    - Update or correct fuel logs if errors occur.

2. Fuel Efficiency & Metrics
    - Calculate fuel efficiency: distance traveled / fuel used (km/l or mpg).
    - Detect abnormal fuel consumption.
    - Generate fuel usage trends per truck, driver, or route.

3. Integration
    - Link fuel logs to trips to automatically calculate consumption per trip.
    - Alert if fuel consumption is unusually high for a truck or route.

4. Audit Trails

    - Log all fuel log creation, updates, or deletion actions.

    - Include timestamp, user, and relevant truck/trip info.

6. Search, Filters, and Reports

    - Search logs by truck, driver, trip, fuel type, or date range.

    - Generate fuel usage reports for cost analysis.


### 5. Tyre Management

Track the full lifecycle of every tyre — from purchase, to installation, rotation, movement between trucks, inspection, and final disposal — while linking tyre wear to mileage, trips, and maintenance.

#### Requirements

1. Tyre Master Record

    - Each tyre must have:

    - Unique tyre ID (internal)

    - Serial number / DOT number

    - Brand

    - Model

    - Size

    - Type (steer, drive, trailer, spare, etc)

    - Purchase date

    - Purchase cost

    - Warranty mileage / expiry

    - Current status

        - IN_INVENTORY

        - INSTALLED

        - DISPOSED

    - Total accumulated mileage

    - Current tread depth (latest reading)

2. Tyre Inventory

    - The system must allow:

    - Adding new tyres to inventory

    - Viewing tyres in stock

    - Filtering by size, brand, tread, age, warranty

    - Marking tyres as reserved for a truck or trip

    - Tyres are not consumables — quantity is not used.
    - Each tyre is an individual asset.

3. Tyre Installation

    When a tyre is installed on a truck:

    The system must record:

    - Tyre ID

    - Truck ID

    - Axle and position (e.g. Front-Left, Rear-Inner-Right)

    - Installation date

    - Odometer reading at installation

    - Tread depth at installation

    The tyre status becomes: INSTALLED

4. Tyre Position Tracking

    Each tyre must always have:

    - Current truck

    - Current axle

    - Current wheel position

    The system must prevent:

    - Two tyres being in the same position

    - A tyre being installed on two trucks

5. Tyre Rotation

    Rotation is not a reinstall — it is a position change on the same truck.

    When rotating:

    - Old position

    - New position

    - Odometer

    - Date

    - Reason (scheduled, uneven wear, puncture etc)

    Rotation history must be stored forever.

6. Tyre Movement Between Trucks

    A tyre can move from:

    - Truck A → Inventory

    - Inventory → Truck B

    This is done in two steps:

    - Remove from truck

    - Install on another

    The system must preserve full history.

7. Tyre Removal

    When removing a tyre from a truck:

    - Date

    - Odometer

    - Tread depth

    - Reason (rotation, puncture, end-of-life, resale)

    The tyre becomes:

    - IN_INVENTORY

    - or DISPOSED

8. Tyre Inspection

    Tyres must support inspection logs:

    - Tyre ID

    - Date

    - Inspector

    - Tread depth

    - Pressure

    - Visual condition

    - Notes

    - Pass / Fail

9. Tyre Mileage Tracking

    Mileage must be calculated using: Truck odometer change while tyre is installed

    The system must accumulate:

    - Mileage per tyre

    - Mileage per position

    - Mileage per truck

10. Tyre Disposal

    When a tyre is disposed:

    - Disposal date

    - Reason

    - Final mileage

    - Disposal type (scrap, resale, warranty claim)

    Disposed tyres can never be re-installed.

### 6. Maintenance Module
The Maintenance Module manages the health, safety, availability, and cost control of all fleet assets by handling:
- Preventive maintenance
- Corrective maintenance
- Inspections
- Work orders
- Breakdowns
- Service history
- Cost tracking
It acts as the central reliability engine of the fleet management system.

Maintenance applies to:
- Trucks
- Tyres (via Tyre Module)
- Installed parts (via Parts Module)
The module must be asset-agnostic, meaning future asset types can be added without refactoring.

#### Requirements

1. Maintenance Plans (Preventive)

The system must allow definition of maintenance plans per asset type.

Plan triggers:
- Mileage
- Engine hours
- Time (days/months/years)
- Number of trips

Each plan must define:
- Asset type
- Trigger condition
- Tasks to perform
- Estimated duration
- Parts required


2. Inspections (Embedded in Maintenance)

Inspections are part of maintenance and serve as decision points.

Inspection types:
- Pre-trip
- Post-trip
- Periodic
- Safety
- Tyre inspection
- Regulatory inspection

Inspection must capture:
- Asset / component
- Inspector
- Inspection checklist
- Condition rating
- Defects
- Photos/documents
- Pass / Fail result

System behavior:
- Failed inspections automatically create work orders
- Severe failures block trip assignment
- Results update asset health metrics

3. Corrective Maintenance

Triggered by:
- Inspection failures
- Driver-reported faults
- Breakdowns
- Manual entry

Corrective maintenance must:
- Create a work order
- Mark asset availability
- Track root cause
- Track resolution

4. Work Orders

A work order represents a maintenance task to be executed.

Work order attributes:
- Unique ID
- Asset
- Maintenance type
- Description
- Priority
- Required parts & tyres
- Assigned technician
- Estimated vs actual cost
- Status lifecycle

Work order status flow:
Draft → Approved → In Progress → Completed → Verified → Closed

5. Breakdown Management

Breakdowns are unplanned failures.

When a breakdown occurs:
- Asset is immediately marked unavailable
- Active trips are flagged
- Emergency work order is created
- Root cause must be logged

6. Cost Tracking

The system must track:
- Labor costs
- Parts costs
- Tyre costs
- External service costs

Costs must be:
- Linked to work orders
- Immutable after verification
- Auditable

#### Integration with other modules

1. Parts Module
- Parts are reserved on work order approval
- Parts are consumed on work order completion
- Serial numbers and warranties are recorded

2. Tyre Module
- Tyre condition updated during maintenance
- Tyre movements logged
- Tyre disposal triggered via maintenance

3. Trip Module
- Unsafe assets cannot be assigned trips
- Maintenance schedules consider trip plans