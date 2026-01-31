# Fleet Management System - Database Design

## Overview
This document outlines the complete database schema for the Fleet Management System, designed following database normalization principles, referential integrity, and best practices for enterprise systems.

## Design Principles Applied
1. **Normalization**: Database normalized to 3NF to eliminate redundancy
2. **Referential Integrity**: All foreign keys properly constrained
3. **Audit Trail**: Comprehensive tracking of all critical operations
4. **Soft Deletes**: Important records are soft-deleted, not physically removed
5. **UUID Primary Keys**: Using UUIDs for distributed system compatibility
6. **Temporal Data**: Proper tracking of effective dates and timestamps
7. **Separation of Concerns**: Clear boundaries between modules
8. **History Tables**: Separate history tracking for lifecycle management

---

## 1. User Management & Authentication Module

### 1.1 User
Core user account information.

```typescript
User {
  id: UUID [PK]
  email: String [UNIQUE, NOT NULL]
  passwordHash: String [NOT NULL]
  firstName: String [NOT NULL]
  lastName: String [NOT NULL]
  phoneNumber: String
  isActive: Boolean [DEFAULT true]
  emailVerified: Boolean [DEFAULT false]
  lastLoginAt: DateTime
  passwordChangedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime [NULLABLE - soft delete]
}
```

### 1.2 Role
Defines system roles.

```typescript
Role {
  id: UUID [PK]
  name: String [UNIQUE, NOT NULL] // ADMIN, FLEET_MANAGER, DRIVER, MECHANIC
  description: String
  isSystem: Boolean [DEFAULT false] // Cannot be deleted if true
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 1.3 Permission
Granular permissions for actions.

```typescript
Permission {
  id: UUID [PK]
  resource: String [NOT NULL] // trucks, drivers, routes, etc.
  action: String [NOT NULL] // create, read, update, delete, approve, etc.
  description: String
  createdAt: DateTime
  
  UNIQUE(resource, action)
}
```

### 1.4 UserRole
Many-to-many relationship between users and roles.

```typescript
UserRole {
  id: UUID [PK]
  userId: UUID [FK -> User.id]
  roleId: UUID [FK -> Role.id]
  assignedBy: UUID [FK -> User.id]
  assignedAt: DateTime
  
  UNIQUE(userId, roleId)
}
```

### 1.5 RolePermission
Many-to-many relationship between roles and permissions.

```typescript
RolePermission {
  id: UUID [PK]
  roleId: UUID [FK -> Role.id]
  permissionId: UUID [FK -> Permission.id]
  createdAt: DateTime
  
  UNIQUE(roleId, permissionId)
}
```

### 1.6 PasswordResetToken
Tracks password reset requests.

```typescript
PasswordResetToken {
  id: UUID [PK]
  userId: UUID [FK -> User.id]
  token: String [UNIQUE, NOT NULL]
  expiresAt: DateTime [NOT NULL]
  usedAt: DateTime [NULLABLE]
  createdAt: DateTime
}
```

---

## 2. Driver Management Module

### 2.1 Driver
Extended profile for driver users.

```typescript
Driver {
  id: UUID [PK]
  userId: UUID [FK -> User.id, UNIQUE, NOT NULL]
  employeeNumber: String [UNIQUE]
  licenseNumber: String [UNIQUE, NOT NULL]
  licenseClass: String [NOT NULL]
  licenseIssueDate: Date
  licenseExpiryDate: Date [NOT NULL]
  licenseIssuingCountry: String
  dateOfBirth: Date
  bloodGroup: String
  emergencyContactName: String
  emergencyContactPhone: String
  status: Enum [ACTIVE, ON_TRIP, OFF_DUTY, ON_LEAVE, SUSPENDED, TERMINATED]
  yearsOfExperience: Integer
  hireDate: Date
  terminationDate: Date [NULLABLE]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}
```

### 2.2 DriverCertification
Tracks additional certifications for drivers.

```typescript
DriverCertification {
  id: UUID [PK]
  driverId: UUID [FK -> Driver.id]
  certificationType: String [NOT NULL] // ADR, HAZMAT, etc.
  certificationNumber: String
  issueDate: Date
  expiryDate: Date
  issuingAuthority: String
  documentUrl: String
  status: Enum [VALID, EXPIRED, SUSPENDED]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 2.3 DriverPerformanceMetric
Tracks driver performance over time.

```typescript
DriverPerformanceMetric {
  id: UUID [PK]
  driverId: UUID [FK -> Driver.id]
  periodStart: Date [NOT NULL]
  periodEnd: Date [NOT NULL]
  totalTrips: Integer
  totalDistanceKm: Decimal
  totalDrivingHours: Decimal
  averageFuelEfficiency: Decimal
  safetyScore: Decimal
  onTimeDeliveryRate: Decimal
  incidentCount: Integer
  calculatedAt: DateTime
  createdAt: DateTime
  
  UNIQUE(driverId, periodStart, periodEnd)
}
```

---

## 3. Truck & Asset Management Module

### 3.1 Truck
Core truck/vehicle information.

```typescript
Truck {
  id: UUID [PK]
  registrationNumber: String [UNIQUE, NOT NULL]
  vin: String [UNIQUE, NOT NULL]
  make: String [NOT NULL]
  model: String [NOT NULL]
  year: Integer [NOT NULL]
  color: String
  fuelType: Enum [DIESEL, PETROL, CNG, LNG, ELECTRIC, HYBRID]
  fuelCapacityLitres: Decimal
  engineNumber: String [UNIQUE]
  chassisNumber: String
  purchaseDate: Date
  purchasePrice: Decimal
  currentOdometer: Decimal [DEFAULT 0]
  currentEngineHours: Decimal [DEFAULT 0]
  status: Enum [ACTIVE, MAINTENANCE, ON_TRIP, OUT_OF_SERVICE, SOLD, SCRAPPED]
  ownership: Enum [OWNED, LEASED, RENTED]
  insurancePolicyNumber: String
  insuranceExpiryDate: Date
  roadTaxExpiryDate: Date
  fitnessExpiryDate: Date
  permitExpiryDate: Date
  gprsDeviceId: String [UNIQUE]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}
```

### 3.2 TruckSpecification
Technical specifications for trucks.

```typescript
TruckSpecification {
  id: UUID [PK]
  truckId: UUID [FK -> Truck.id, UNIQUE]
  grossVehicleWeight: Decimal
  cargoCapacityKg: Decimal
  cargoVolumeCubicMeters: Decimal
  numberOfAxles: Integer
  numberOfWheels: Integer
  tyreSize: String
  transmissionType: String
  engineCapacityCC: Integer
  horsePower: Integer
  dimensions: JSON // {length, width, height}
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 3.3 TruckDocument
Stores truck-related documents.

```typescript
TruckDocument {
  id: UUID [PK]
  truckId: UUID [FK -> Truck.id]
  documentType: Enum [REGISTRATION, INSURANCE, PERMIT, FITNESS, ROADTAX, OTHER]
  documentNumber: String
  issueDate: Date
  expiryDate: Date
  documentUrl: String [NOT NULL]
  uploadedBy: UUID [FK -> User.id]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 4. Parts & Inventory Management Module

### 4.1 Part
Individual parts/components inventory.

```typescript
Part {
  id: UUID [PK]
  partNumber: String [UNIQUE, NOT NULL]
  name: String [NOT NULL]
  description: Text
  category: Enum [ENGINE, TRANSMISSION, BRAKES, ELECTRICAL, SUSPENSION, BODY, TYRES, FILTERS, FLUIDS, OTHER]
  manufacturer: String
  supplierPartNumber: String
  isSerializedAsset: Boolean [DEFAULT false] // true for trackable items, false for consumables
  serialNumber: String [NULLABLE, UNIQUE if isSerializedAsset]
  unitOfMeasure: String // pieces, liters, kg, etc.
  minStockLevel: Integer
  maxStockLevel: Integer
  reorderPoint: Integer
  quantityInStock: Integer [DEFAULT 0]
  quantityReserved: Integer [DEFAULT 0]
  unitCost: Decimal
  averageCost: Decimal
  lastPurchasePrice: Decimal
  lastPurchaseDate: Date
  warrantyMonths: Integer
  warrantyMileage: Integer
  status: Enum [ACTIVE, DISCONTINUED, OUT_OF_STOCK]
  location: String // warehouse location
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}
```

### 4.2 PartInstallation
Tracks parts installed on trucks (for serialized parts).

```typescript
PartInstallation {
  id: UUID [PK]
  partId: UUID [FK -> Part.id, NOT NULL]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  installationDate: Date [NOT NULL]
  odometerAtInstallation: Decimal [NOT NULL]
  engineHoursAtInstallation: Decimal
  installedBy: UUID [FK -> User.id]
  workOrderId: UUID [FK -> WorkOrder.id, NULLABLE]
  warrantyStartDate: Date
  warrantyEndDate: Date
  expectedReplacementMileage: Decimal
  removalDate: Date [NULLABLE]
  odometerAtRemoval: Decimal [NULLABLE]
  engineHoursAtRemoval: Decimal [NULLABLE]
  removalReason: String
  removedBy: UUID [FK -> User.id, NULLABLE]
  status: Enum [INSTALLED, REMOVED]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4.3 PartTransaction
Tracks all inventory movements.

```typescript
PartTransaction {
  id: UUID [PK]
  partId: UUID [FK -> Part.id, NOT NULL]
  transactionType: Enum [PURCHASE, SALE, INSTALL, REMOVE, DISPOSAL, ADJUSTMENT, RETURN, TRANSFER]
  quantityChange: Integer [NOT NULL] // positive for additions, negative for reductions
  unitPrice: Decimal
  totalCost: Decimal
  fromLocation: String
  toLocation: String
  truckId: UUID [FK -> Truck.id, NULLABLE]
  workOrderId: UUID [FK -> WorkOrder.id, NULLABLE]
  referenceNumber: String // PO number, invoice, etc.
  performedBy: UUID [FK -> User.id, NOT NULL]
  notes: Text
  transactionDate: DateTime [NOT NULL]
  createdAt: DateTime
}
```

### 4.4 PartSupplier
Supplier information for parts.

```typescript
PartSupplier {
  id: UUID [PK]
  name: String [UNIQUE, NOT NULL]
  contactPerson: String
  email: String
  phone: String
  address: Text
  city: String
  country: String
  paymentTerms: String
  isActive: Boolean [DEFAULT true]
  rating: Decimal
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4.5 PartSupplierMapping
Links parts to their suppliers.

```typescript
PartSupplierMapping {
  id: UUID [PK]
  partId: UUID [FK -> Part.id]
  supplierId: UUID [FK -> PartSupplier.id]
  supplierPartNumber: String
  leadTimeDays: Integer
  minimumOrderQuantity: Integer
  unitPrice: Decimal
  currency: String
  isPreferred: Boolean [DEFAULT false]
  createdAt: DateTime
  updatedAt: DateTime
  
  UNIQUE(partId, supplierId)
}
```

---

## 5. Route & Trip Management Module

### 5.1 Route
Predefined routes for trips.

```typescript
Route {
  id: UUID [PK]
  routeCode: String [UNIQUE, NOT NULL]
  name: String [NOT NULL]
  description: Text
  startLocationName: String [NOT NULL]
  startLocationCoords: Point // Geography type
  endLocationName: String [NOT NULL]
  endLocationCoords: Point
  routeType: Enum [SHORT_HAUL, LONG_HAUL, REGIONAL, INTERNATIONAL]
  estimatedDistanceKm: Decimal [NOT NULL]
  estimatedDurationHours: Decimal [NOT NULL]
  isActive: Boolean [DEFAULT true]
  createdBy: UUID [FK -> User.id]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
}
```

### 5.2 RouteStop
Intermediate stops along a route.

```typescript
RouteStop {
  id: UUID [PK]
  routeId: UUID [FK -> Route.id]
  stopSequence: Integer [NOT NULL]
  locationName: String [NOT NULL]
  locationCoords: Point
  stopType: Enum [WAYPOINT, REST_AREA, FUEL_STATION, CHECKPOINT, DELIVERY_POINT]
  estimatedArrivalMinutes: Integer // from route start
  plannedStayMinutes: Integer
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  
  UNIQUE(routeId, stopSequence)
}
```

### 5.3 Trip
Individual trip instances.

```typescript
Trip {
  id: UUID [PK]
  tripNumber: String [UNIQUE, NOT NULL]
  routeId: UUID [FK -> Route.id, NOT NULL]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  driverId: UUID [FK -> Driver.id, NOT NULL]
  coDriverId: UUID [FK -> Driver.id, NULLABLE]
  scheduledDeparture: DateTime [NOT NULL]
  scheduledArrival: DateTime
  actualDeparture: DateTime
  actualArrival: DateTime
  status: Enum [SCHEDULED, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED]
  odometerStart: Decimal
  odometerEnd: Decimal
  actualDistanceKm: Decimal
  averageSpeedKmh: Decimal
  fuelConsumedLitres: Decimal
  cargoWeight: Decimal
  cargoDescription: Text
  clientName: String
  deliveryNoteNumber: String
  cancellationReason: Text
  delayReason: Text
  notes: Text
  createdBy: UUID [FK -> User.id]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 5.4 TripTracking
GPS tracking data for trips.

```typescript
TripTracking {
  id: UUID [PK]
  tripId: UUID [FK -> Trip.id, NOT NULL]
  latitude: Decimal [NOT NULL]
  longitude: Decimal [NOT NULL]
  altitude: Decimal
  speed: Decimal
  heading: Decimal
  accuracy: Decimal
  recordedAt: DateTime [NOT NULL]
  createdAt: DateTime
  
  INDEX(tripId, recordedAt)
}
```

### 5.5 TripStop
Actual stops made during a trip.

```typescript
TripStop {
  id: UUID [PK]
  tripId: UUID [FK -> Trip.id]
  routeStopId: UUID [FK -> RouteStop.id, NULLABLE]
  locationName: String [NOT NULL]
  locationCoords: Point
  arrivalTime: DateTime [NOT NULL]
  departureTime: DateTime
  durationMinutes: Integer
  stopType: Enum [PLANNED, UNPLANNED, EMERGENCY, FUEL, REST, DELIVERY]
  notes: Text
  createdAt: DateTime
}
```

### 5.6 TripIncident
Records incidents during trips.

```typescript
TripIncident {
  id: UUID [PK]
  tripId: UUID [FK -> Trip.id, NOT NULL]
  incidentType: Enum [ACCIDENT, BREAKDOWN, DELAY, TRAFFIC, WEATHER, THEFT, OTHER]
  severity: Enum [LOW, MEDIUM, HIGH, CRITICAL]
  locationName: String
  locationCoords: Point
  occurredAt: DateTime [NOT NULL]
  description: Text [NOT NULL]
  actionTaken: Text
  reportedBy: UUID [FK -> User.id]
  policeReportNumber: String
  insuranceClaimNumber: String
  estimatedCost: Decimal
  actualCost: Decimal
  resolved: Boolean [DEFAULT false]
  resolvedAt: DateTime
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 6. Fuel Management Module

### 6.1 FuelLog
Records all fuel transactions.

```typescript
FuelLog {
  id: UUID [PK]
  logNumber: String [UNIQUE, NOT NULL]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  driverId: UUID [FK -> Driver.id, NOT NULL]
  tripId: UUID [FK -> Trip.id, NULLABLE]
  fuelType: Enum [DIESEL, PETROL, CNG, LNG, ELECTRIC]
  amountLitres: Decimal [NOT NULL]
  costPerLitre: Decimal [NOT NULL]
  totalCost: Decimal [NOT NULL]
  odometerReading: Decimal [NOT NULL]
  filledAt: DateTime [NOT NULL]
  locationName: String [NOT NULL]
  locationCoords: Point
  fuelStationName: String
  receiptNumber: String
  paymentMethod: Enum [CASH, CARD, FLEET_CARD, ACCOUNT]
  isFullTank: Boolean [DEFAULT false]
  previousOdometerReading: Decimal
  distanceSinceLastFill: Decimal
  fuelEfficiency: Decimal // km/litre
  notes: Text
  recordedBy: UUID [FK -> User.id]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 6.2 FuelCard
Tracks fuel cards issued to drivers/trucks.

```typescript
FuelCard {
  id: UUID [PK]
  cardNumber: String [UNIQUE, NOT NULL]
  cardProvider: String [NOT NULL]
  truckId: UUID [FK -> Truck.id, NULLABLE]
  driverId: UUID [FK -> Driver.id, NULLABLE]
  issueDate: Date [NOT NULL]
  expiryDate: Date [NOT NULL]
  dailyLimit: Decimal
  monthlyLimit: Decimal
  isActive: Boolean [DEFAULT true]
  suspendedAt: DateTime
  suspensionReason: Text
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 6.3 FuelPriceHistory
Tracks fuel price changes over time.

```typescript
FuelPriceHistory {
  id: UUID [PK]
  fuelType: Enum [DIESEL, PETROL, CNG, LNG]
  pricePerLitre: Decimal [NOT NULL]
  locationName: String
  city: String
  country: String
  effectiveFrom: Date [NOT NULL]
  effectiveTo: Date
  source: String
  createdAt: DateTime
  
  INDEX(fuelType, effectiveFrom)
}
```

---

## 7. Tyre Management Module

### 7.1 Tyre
Master record for each individual tyre.

```typescript
Tyre {
  id: UUID [PK]
  tyreNumber: String [UNIQUE, NOT NULL] // Internal tracking number
  serialNumber: String [UNIQUE] // DOT number
  brand: String [NOT NULL]
  model: String [NOT NULL]
  size: String [NOT NULL]
  tyreType: Enum [STEER, DRIVE, TRAILER, SPARE]
  plyRating: String
  loadIndex: String
  speedRating: String
  purchaseDate: Date [NOT NULL]
  purchaseCost: Decimal [NOT NULL]
  supplierId: UUID [FK -> PartSupplier.id]
  warrantyMileage: Integer
  warrantyExpiryDate: Date
  status: Enum [IN_INVENTORY, INSTALLED, DISPOSED]
  totalAccumulatedMileage: Decimal [DEFAULT 0]
  currentTreadDepth: Decimal // in mm
  originalTreadDepth: Decimal [NOT NULL]
  disposalDate: Date
  disposalReason: Enum [WORN_OUT, DAMAGED, PUNCTURE, AGE, WARRANTY_CLAIM]
  disposalType: Enum [SCRAP, RETREAD, RESALE, WARRANTY_RETURN]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 7.2 TyreInstallation
Tracks tyre installation on trucks.

```typescript
TyreInstallation {
  id: UUID [PK]
  tyreId: UUID [FK -> Tyre.id, NOT NULL]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  axlePosition: String [NOT NULL] // FRONT, REAR_1, REAR_2, etc.
  wheelPosition: Enum [LEFT_OUTER, LEFT_INNER, RIGHT_OUTER, RIGHT_INNER, SINGLE]
  installationDate: Date [NOT NULL]
  odometerAtInstallation: Decimal [NOT NULL]
  treadDepthAtInstallation: Decimal [NOT NULL]
  pressureAtInstallation: Decimal // PSI
  installedBy: UUID [FK -> User.id]
  workOrderId: UUID [FK -> WorkOrder.id, NULLABLE]
  removalDate: Date [NULLABLE]
  odometerAtRemoval: Decimal [NULLABLE]
  treadDepthAtRemoval: Decimal [NULLABLE]
  mileageCovered: Decimal [NULLABLE]
  removalReason: Enum [ROTATION, REPLACEMENT, PUNCTURE, DAMAGE, END_OF_LIFE]
  removedBy: UUID [FK -> User.id, NULLABLE]
  status: Enum [ACTIVE, REMOVED]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  
  UNIQUE(truckId, axlePosition, wheelPosition, status) WHERE status = 'ACTIVE'
}
```

### 7.3 TyreRotation
Tracks tyre position changes within a truck.

```typescript
TyreRotation {
  id: UUID [PK]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  rotationDate: Date [NOT NULL]
  odometerReading: Decimal [NOT NULL]
  reason: String
  performedBy: UUID [FK -> User.id, NOT NULL]
  workOrderId: UUID [FK -> WorkOrder.id, NULLABLE]
  notes: Text
  createdAt: DateTime
}
```

### 7.4 TyreRotationDetail
Individual tyre movements in a rotation.

```typescript
TyreRotationDetail {
  id: UUID [PK]
  rotationId: UUID [FK -> TyreRotation.id, NOT NULL]
  tyreId: UUID [FK -> Tyre.id, NOT NULL]
  fromAxlePosition: String [NOT NULL]
  fromWheelPosition: Enum [LEFT_OUTER, LEFT_INNER, RIGHT_OUTER, RIGHT_INNER, SINGLE]
  toAxlePosition: String [NOT NULL]
  toWheelPosition: Enum [LEFT_OUTER, LEFT_INNER, RIGHT_OUTER, RIGHT_INNER, SINGLE]
  treadDepthBefore: Decimal
  treadDepthAfter: Decimal
  createdAt: DateTime
}
```

### 7.5 TyreInspection
Regular tyre inspections.

```typescript
TyreInspection {
  id: UUID [PK]
  tyreId: UUID [FK -> Tyre.id, NOT NULL]
  truckId: UUID [FK -> Truck.id, NULLABLE]
  inspectionDate: Date [NOT NULL]
  odometerReading: Decimal
  inspectedBy: UUID [FK -> User.id, NOT NULL]
  treadDepth: Decimal [NOT NULL]
  pressure: Decimal [NOT NULL]
  visualCondition: Enum [EXCELLENT, GOOD, FAIR, POOR, CRITICAL]
  hasUniformWear: Boolean
  hasCuts: Boolean
  hasCracks: Boolean
  hasBulges: Boolean
  hasEmbeddedObjects: Boolean
  alignmentIssues: Boolean
  passFail: Enum [PASS, FAIL]
  actionRequired: Text
  notes: Text
  createdAt: DateTime
}
```

---

## 8. Maintenance Management Module

### 8.1 MaintenancePlan
Template for preventive maintenance schedules.

```typescript
MaintenancePlan {
  id: UUID [PK]
  planCode: String [UNIQUE, NOT NULL]
  name: String [NOT NULL]
  description: Text
  assetType: Enum [TRUCK, TRAILER, EQUIPMENT]
  maintenanceType: Enum [PREVENTIVE, INSPECTION, REGULATORY]
  triggerType: Enum [MILEAGE, ENGINE_HOURS, TIME_DAYS, TIME_MONTHS, TRIP_COUNT]
  triggerValue: Integer [NOT NULL]
  estimatedDurationHours: Decimal
  estimatedCost: Decimal
  isActive: Boolean [DEFAULT true]
  createdBy: UUID [FK -> User.id]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 8.2 MaintenancePlanTask
Tasks within a maintenance plan.

```typescript
MaintenancePlanTask {
  id: UUID [PK]
  planId: UUID [FK -> MaintenancePlan.id, NOT NULL]
  taskSequence: Integer [NOT NULL]
  taskName: String [NOT NULL]
  description: Text
  category: Enum [INSPECTION, SERVICE, REPLACEMENT, REPAIR, CLEANING, TESTING]
  estimatedDurationMinutes: Integer
  requiresSpecialist: Boolean [DEFAULT false]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  
  UNIQUE(planId, taskSequence)
}
```

### 8.3 MaintenancePlanPart
Parts required for a maintenance plan.

```typescript
MaintenancePlanPart {
  id: UUID [PK]
  planId: UUID [FK -> MaintenancePlan.id, NOT NULL]
  partId: UUID [FK -> Part.id, NOT NULL]
  quantityRequired: Decimal [NOT NULL]
  isOptional: Boolean [DEFAULT false]
  createdAt: DateTime
  
  UNIQUE(planId, partId)
}
```

### 8.4 MaintenanceSchedule
Scheduled maintenance for specific assets.

```typescript
MaintenanceSchedule {
  id: UUID [PK]
  planId: UUID [FK -> MaintenancePlan.id, NOT NULL]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  scheduledDate: Date [NOT NULL]
  dueAtOdometer: Decimal
  dueAtEngineHours: Decimal
  priority: Enum [LOW, MEDIUM, HIGH, CRITICAL]
  status: Enum [SCHEDULED, DUE, OVERDUE, IN_PROGRESS, COMPLETED, CANCELLED]
  workOrderId: UUID [FK -> WorkOrder.id, NULLABLE]
  completedDate: Date
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
  
  INDEX(truckId, scheduledDate)
}
```

### 8.5 WorkOrder
Work orders for maintenance activities.

```typescript
WorkOrder {
  id: UUID [PK]
  workOrderNumber: String [UNIQUE, NOT NULL]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  maintenanceType: Enum [PREVENTIVE, CORRECTIVE, INSPECTION, BREAKDOWN, REGULATORY]
  maintenanceScheduleId: UUID [FK -> MaintenanceSchedule.id, NULLABLE]
  title: String [NOT NULL]
  description: Text [NOT NULL]
  priority: Enum [LOW, MEDIUM, HIGH, CRITICAL]
  status: Enum [DRAFT, APPROVED, IN_PROGRESS, COMPLETED, VERIFIED, CLOSED, CANCELLED]
  reportedBy: UUID [FK -> User.id]
  assignedTo: UUID [FK -> User.id, NULLABLE]
  approvedBy: UUID [FK -> User.id, NULLABLE]
  approvedAt: DateTime
  scheduledStartDate: Date
  actualStartDate: Date
  scheduledEndDate: Date
  actualEndDate: Date
  odometerAtStart: Decimal
  odometerAtEnd: Decimal
  laborCost: Decimal [DEFAULT 0]
  partsCost: Decimal [DEFAULT 0]
  externalServiceCost: Decimal [DEFAULT 0]
  totalCost: Decimal [DEFAULT 0]
  estimatedCost: Decimal
  downTimeHours: Decimal
  failureCategory: String
  rootCause: Text
  resolution: Text
  preventiveAction: Text
  requiresFollowUp: Boolean [DEFAULT false]
  followUpDate: Date
  verifiedBy: UUID [FK -> User.id, NULLABLE]
  verifiedAt: DateTime
  closedBy: UUID [FK -> User.id, NULLABLE]
  closedAt: DateTime
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 8.6 WorkOrderTask
Tasks performed in a work order.

```typescript
WorkOrderTask {
  id: UUID [PK]
  workOrderId: UUID [FK -> WorkOrder.id, NOT NULL]
  taskSequence: Integer
  taskName: String [NOT NULL]
  description: Text
  status: Enum [PENDING, IN_PROGRESS, COMPLETED, SKIPPED]
  performedBy: UUID [FK -> User.id, NULLABLE]
  startedAt: DateTime
  completedAt: DateTime
  durationMinutes: Integer
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 8.7 WorkOrderPart
Parts used in a work order.

```typescript
WorkOrderPart {
  id: UUID [PK]
  workOrderId: UUID [FK -> WorkOrder.id, NOT NULL]
  partId: UUID [FK -> Part.id, NOT NULL]
  quantityRequested: Decimal [NOT NULL]
  quantityUsed: Decimal [DEFAULT 0]
  unitCost: Decimal [NOT NULL]
  totalCost: Decimal [NOT NULL]
  status: Enum [REQUESTED, RESERVED, ISSUED, RETURNED]
  issuedBy: UUID [FK -> User.id, NULLABLE]
  issuedAt: DateTime
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 8.8 Inspection
General inspection records.

```typescript
Inspection {
  id: UUID [PK]
  inspectionNumber: String [UNIQUE, NOT NULL]
  inspectionType: Enum [PRE_TRIP, POST_TRIP, PERIODIC, SAFETY, REGULATORY]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  driverId: UUID [FK -> Driver.id, NULLABLE]
  inspectorId: UUID [FK -> User.id, NOT NULL]
  tripId: UUID [FK -> Trip.id, NULLABLE]
  scheduledDate: Date
  actualDate: Date [NOT NULL]
  odometerReading: Decimal
  location: String
  overallResult: Enum [PASS, PASS_WITH_NOTES, FAIL]
  overallCondition: Enum [EXCELLENT, GOOD, FAIR, POOR, CRITICAL]
  defectsCount: Integer [DEFAULT 0]
  criticalDefectsCount: Integer [DEFAULT 0]
  workOrderCreated: Boolean [DEFAULT false]
  workOrderId: UUID [FK -> WorkOrder.id, NULLABLE]
  notes: Text
  nextInspectionDue: Date
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 8.9 InspectionItem
Individual items checked during inspection.

```typescript
InspectionItem {
  id: UUID [PK]
  inspectionId: UUID [FK -> Inspection.id, NOT NULL]
  itemSequence: Integer
  category: String [NOT NULL] // Engine, Brakes, Lights, Tyres, etc.
  itemName: String [NOT NULL]
  checkResult: Enum [OK, MINOR_ISSUE, MAJOR_ISSUE, CRITICAL, NOT_APPLICABLE]
  condition: Enum [EXCELLENT, GOOD, FAIR, POOR, FAILED]
  measurement: String // if applicable
  notes: Text
  requiresAction: Boolean [DEFAULT false]
  actionRequired: Text
  photoUrl: String
  createdAt: DateTime
}
```

### 8.10 Breakdown
Records equipment breakdowns.

```typescript
Breakdown {
  id: UUID [PK]
  breakdownNumber: String [UNIQUE, NOT NULL]
  truckId: UUID [FK -> Truck.id, NOT NULL]
  tripId: UUID [FK -> Trip.id, NULLABLE]
  driverId: UUID [FK -> Driver.id, NULLABLE]
  occurredAt: DateTime [NOT NULL]
  reportedAt: DateTime [NOT NULL]
  reportedBy: UUID [FK -> User.id, NOT NULL]
  locationName: String
  locationCoords: Point
  odometerReading: Decimal
  breakdownType: Enum [MECHANICAL, ELECTRICAL, TYRE, ACCIDENT, OTHER]
  severity: Enum [LOW, MEDIUM, HIGH, CRITICAL]
  symptomDescription: Text [NOT NULL]
  isOperational: Boolean [DEFAULT false]
  requiresTowing: Boolean [DEFAULT false]
  workOrderId: UUID [FK -> WorkOrder.id, NULLABLE]
  resolvedAt: DateTime
  resolutionTime: Integer // minutes
  downTimeHours: Decimal
  estimatedRepairCost: Decimal
  actualRepairCost: Decimal
  status: Enum [REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED]
  notes: Text
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 9. Audit & System Logging Module

### 9.1 AuditLog
Comprehensive audit trail for all critical actions.

```typescript
AuditLog {
  id: UUID [PK]
  userId: UUID [FK -> User.id, NOT NULL]
  userName: String [NOT NULL] // Denormalized for history
  action: String [NOT NULL] // CREATE, UPDATE, DELETE, APPROVE, etc.
  entityType: String [NOT NULL] // User, Truck, Trip, etc.
  entityId: String [NOT NULL]
  moduleName: String [NOT NULL]
  oldValues: JSONB // Previous state
  newValues: JSONB // New state
  changes: JSONB // Specific fields changed
  ipAddress: String
  userAgent: String
  success: Boolean [DEFAULT true]
  errorMessage: Text
  timestamp: DateTime [NOT NULL]
  
  INDEX(userId, timestamp)
  INDEX(entityType, entityId, timestamp)
  INDEX(timestamp)
}
```

### 9.2 SystemLog
System-level events and errors.

```typescript
SystemLog {
  id: UUID [PK]
  logLevel: Enum [DEBUG, INFO, WARNING, ERROR, CRITICAL]
  service: String [NOT NULL]
  module: String
  message: Text [NOT NULL]
  stackTrace: Text
  context: JSONB
  userId: UUID [FK -> User.id, NULLABLE]
  requestId: String
  ipAddress: String
  timestamp: DateTime [NOT NULL]
  
  INDEX(logLevel, timestamp)
  INDEX(service, timestamp)
}
```

### 9.3 LoginHistory
Track user login attempts and sessions.

```typescript
LoginHistory {
  id: UUID [PK]
  userId: UUID [FK -> User.id, NULLABLE]
  email: String [NOT NULL]
  success: Boolean [NOT NULL]
  failureReason: String
  ipAddress: String
  userAgent: String
  deviceType: String
  location: String
  sessionId: String
  loggedOutAt: DateTime
  attemptedAt: DateTime [NOT NULL]
  
  INDEX(userId, attemptedAt)
  INDEX(ipAddress, attemptedAt)
}
```

---

## 10. Notification & Alert Module

### 10.1 Notification
User notifications.

```typescript
Notification {
  id: UUID [PK]
  userId: UUID [FK -> User.id, NOT NULL]
  notificationType: Enum [INFO, WARNING, ALERT, CRITICAL]
  category: String [NOT NULL] // MAINTENANCE, TRIP, DOCUMENT, SYSTEM
  title: String [NOT NULL]
  message: Text [NOT NULL]
  entityType: String // Reference to related entity
  entityId: String
  actionUrl: String
  isRead: Boolean [DEFAULT false]
  readAt: DateTime
  expiresAt: DateTime
  createdAt: DateTime
  
  INDEX(userId, isRead, createdAt)
}
```

### 10.2 AlertRule
Configurable system alerts.

```typescript
AlertRule {
  id: UUID [PK]
  ruleName: String [UNIQUE, NOT NULL]
  description: Text
  category: String [NOT NULL]
  condition: JSONB [NOT NULL] // JSON definition of trigger condition
  severity: Enum [LOW, MEDIUM, HIGH, CRITICAL]
  notificationChannels: String[] // email, sms, push, dashboard
  recipientRoles: String[]
  recipientUsers: UUID[]
  isActive: Boolean [DEFAULT true]
  cooldownMinutes: Integer [DEFAULT 60]
  lastTriggeredAt: DateTime
  triggerCount: Integer [DEFAULT 0]
  createdBy: UUID [FK -> User.id]
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Relationships Summary

### Key Foreign Key Relationships:
- Driver → User (1:1)
- UserRole → User, Role (M:N via junction)
- RolePermission → Role, Permission (M:N via junction)
- Truck documents, installations → Truck (1:M)
- Part transactions, installations → Part (1:M)
- Trip → Route, Truck, Driver (M:1)
- FuelLog → Truck, Driver, Trip (M:1)
- Tyre installations, inspections → Tyre, Truck (M:1)
- WorkOrder → Truck (M:1)
- MaintenanceSchedule → MaintenancePlan, Truck (M:1)
- AuditLog → User (M:1)

### Indexes Required:
- All foreign keys should have indexes
- Timestamp fields for filtering (createdAt, updatedAt)
- Status fields for filtering
- Unique constraints on business keys (registrationNumber, VIN, email, etc.)
- Composite indexes for common query patterns
- GIS indexes for location-based queries

### Triggers Recommended:
- Update truck status based on trip assignments
- Auto-calculate costs in work orders
- Update part stock levels on transactions
- Calculate mileage for tyres and parts
- Prevent overlapping trip assignments
- Validate inspection results create work orders
- Update driver status based on trip status

---

## Data Integrity Rules

1. **Cascade Deletes**: Limited - mostly soft deletes for important entities
2. **ON DELETE RESTRICT**: For critical references (User, Truck, Part)
3. **Constraints**: 
   - No overlapping trips for same truck/driver
   - No duplicate tyre positions on same truck
   - Valid date ranges (start < end)
   - Positive quantities and costs
4. **Check Constraints**:
   - Odometer readings always increasing
   - Valid enum values
   - Email format validation
   - Phone number format

---

## Performance Considerations

1. **Partitioning**: Consider partitioning by date for high-volume tables (AuditLog, TripTracking, SystemLog)
2. **Archival**: Strategy for moving old data to archive tables
3. **Materialized Views**: For complex reporting queries
4. **Read Replicas**: For reporting and analytics
5. **Connection Pooling**: Proper configuration for concurrent access
6. **Query Optimization**: Regular analysis and index tuning

---

This design provides a complete, normalized, and scalable database schema that meets all requirements specified in the Fleet Management System requirements document.
