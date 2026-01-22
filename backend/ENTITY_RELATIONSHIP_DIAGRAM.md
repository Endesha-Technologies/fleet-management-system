# Fleet Management System - Entity Relationship Diagram

This document contains the Entity Relationship Diagrams for the Fleet Management System using Mermaid syntax.

## Core User Management

```mermaid
erDiagram
    User ||--o{ UserRole : has
    User ||--o{ AuditLog : performs
    User ||--o{ LoginHistory : records
    User ||--o{ PasswordResetToken : requests
    Role ||--o{ UserRole : assigned_to
    Role ||--o{ RolePermission : has
    Permission ||--o{ RolePermission : granted_in
    
    User {
        uuid id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        string phoneNumber
        boolean isActive
        boolean emailVerified
        timestamp lastLoginAt
        timestamp passwordChangedAt
    }
    
    Role {
        uuid id PK
        string name UK
        string description
        boolean isSystem
    }
    
    Permission {
        uuid id PK
        string resource
        string action
        string description
    }
```

## Driver Management

```mermaid
erDiagram
    User ||--|| Driver : extends
    Driver ||--o{ DriverCertification : has
    Driver ||--o{ DriverPerformanceMetric : tracks
    Driver ||--o{ Trip : drives
    Driver ||--o{ FuelLog : records
    
    Driver {
        uuid id PK
        uuid userId FK
        string employeeNumber UK
        string licenseNumber UK
        string licenseClass
        date licenseExpiryDate
        enum status
        int yearsOfExperience
        date hireDate
    }
    
    DriverCertification {
        uuid id PK
        uuid driverId FK
        string certificationType
        string certificationNumber
        date expiryDate
        enum status
    }
```

## Truck & Asset Management

```mermaid
erDiagram
    Truck ||--|| TruckSpecification : has
    Truck ||--o{ TruckDocument : has
    Truck ||--o{ Trip : assigned_to
    Truck ||--o{ PartInstallation : has
    Truck ||--o{ TyreInstallation : has
    Truck ||--o{ WorkOrder : requires
    Truck ||--o{ FuelLog : consumes
    
    Truck {
        uuid id PK
        string registrationNumber UK
        string vin UK
        string make
        string model
        int year
        enum fuelType
        decimal currentOdometer
        enum status
        enum ownership
    }
    
    TruckSpecification {
        uuid id PK
        uuid truckId FK
        decimal grossVehicleWeight
        decimal cargoCapacityKg
        int numberOfAxles
        int numberOfWheels
    }
```

## Parts & Inventory Management

```mermaid
erDiagram
    Part ||--o{ PartInstallation : installed_as
    Part ||--o{ PartTransaction : tracked_in
    Part ||--o{ PartSupplierMapping : supplied_by
    Part ||--o{ MaintenancePlanPart : required_in
    Part ||--o{ WorkOrderPart : used_in
    PartSupplier ||--o{ PartSupplierMapping : supplies
    Truck ||--o{ PartInstallation : receives
    
    Part {
        uuid id PK
        string partNumber UK
        string name
        enum category
        boolean isSerializedAsset
        string serialNumber UK
        int quantityInStock
        decimal unitCost
        enum status
    }
    
    PartInstallation {
        uuid id PK
        uuid partId FK
        uuid truckId FK
        date installationDate
        decimal odometerAtInstallation
        date removalDate
        enum status
    }
    
    PartTransaction {
        uuid id PK
        uuid partId FK
        enum transactionType
        int quantityChange
        decimal totalCost
        timestamp transactionDate
    }
```

## Route & Trip Management

```mermaid
erDiagram
    Route ||--o{ RouteStop : contains
    Route ||--o{ Trip : defines
    Trip ||--o{ TripTracking : tracks
    Trip ||--o{ TripStop : makes
    Trip ||--o{ TripIncident : experiences
    Trip ||--o{ FuelLog : logs
    Truck ||--o{ Trip : performs
    Driver ||--o{ Trip : drives
    
    Route {
        uuid id PK
        string routeCode UK
        string name
        string startLocationName
        string endLocationName
        enum routeType
        decimal estimatedDistanceKm
    }
    
    Trip {
        uuid id PK
        string tripNumber UK
        uuid routeId FK
        uuid truckId FK
        uuid driverId FK
        timestamp scheduledDeparture
        timestamp actualDeparture
        enum status
        decimal actualDistanceKm
    }
    
    TripTracking {
        uuid id PK
        uuid tripId FK
        decimal latitude
        decimal longitude
        decimal speed
        timestamp recordedAt
    }
```

## Fuel Management

```mermaid
erDiagram
    Truck ||--o{ FuelLog : refuels
    Driver ||--o{ FuelLog : logs
    Trip ||--o{ FuelLog : consumes
    Truck ||--o{ FuelCard : assigned
    Driver ||--o{ FuelCard : assigned
    
    FuelLog {
        uuid id PK
        string logNumber UK
        uuid truckId FK
        uuid driverId FK
        uuid tripId FK
        enum fuelType
        decimal amountLitres
        decimal totalCost
        decimal odometerReading
        timestamp filledAt
    }
    
    FuelCard {
        uuid id PK
        string cardNumber UK
        string cardProvider
        uuid truckId FK
        uuid driverId FK
        date expiryDate
        decimal dailyLimit
        boolean isActive
    }
```

## Tyre Management

```mermaid
erDiagram
    Tyre ||--o{ TyreInstallation : installed_as
    Tyre ||--o{ TyreInspection : inspected_in
    Tyre ||--o{ TyreRotationDetail : rotated_in
    Truck ||--o{ TyreInstallation : receives
    TyreRotation ||--o{ TyreRotationDetail : contains
    Truck ||--|| TyreRotation : undergoes
    
    Tyre {
        uuid id PK
        string tyreNumber UK
        string serialNumber UK
        string brand
        string model
        string size
        enum tyreType
        enum status
        decimal totalAccumulatedMileage
        decimal currentTreadDepth
    }
    
    TyreInstallation {
        uuid id PK
        uuid tyreId FK
        uuid truckId FK
        string axlePosition
        enum wheelPosition
        date installationDate
        decimal odometerAtInstallation
        enum status
    }
    
    TyreInspection {
        uuid id PK
        uuid tyreId FK
        date inspectionDate
        decimal treadDepth
        decimal pressure
        enum visualCondition
        enum passFail
    }
```

## Maintenance Management

```mermaid
erDiagram
    MaintenancePlan ||--o{ MaintenancePlanTask : contains
    MaintenancePlan ||--o{ MaintenancePlanPart : requires
    MaintenancePlan ||--o{ MaintenanceSchedule : schedules
    Truck ||--o{ MaintenanceSchedule : scheduled_for
    MaintenanceSchedule ||--|| WorkOrder : creates
    Truck ||--o{ WorkOrder : requires
    WorkOrder ||--o{ WorkOrderTask : contains
    WorkOrder ||--o{ WorkOrderPart : uses
    Truck ||--o{ Inspection : undergoes
    Inspection ||--o{ InspectionItem : checks
    Truck ||--o{ Breakdown : experiences
    
    MaintenancePlan {
        uuid id PK
        string planCode UK
        string name
        enum assetType
        enum maintenanceType
        enum triggerType
        int triggerValue
    }
    
    WorkOrder {
        uuid id PK
        string workOrderNumber UK
        uuid truckId FK
        enum maintenanceType
        string title
        enum priority
        enum status
        decimal totalCost
    }
    
    Inspection {
        uuid id PK
        string inspectionNumber UK
        uuid truckId FK
        uuid inspectorId FK
        enum inspectionType
        enum overallResult
        int defectsCount
    }
    
    Breakdown {
        uuid id PK
        string breakdownNumber UK
        uuid truckId FK
        uuid tripId FK
        enum breakdownType
        enum severity
        timestamp occurredAt
        enum status
    }
```

## System & Notifications

```mermaid
erDiagram
    User ||--o{ Notification : receives
    User ||--o{ SystemLog : triggers
    User ||--o{ AlertRule : creates
    
    AuditLog {
        uuid id PK
        uuid userId FK
        string action
        string entityType
        string entityId
        jsonb oldValues
        jsonb newValues
        timestamp timestamp
    }
    
    Notification {
        uuid id PK
        uuid userId FK
        enum notificationType
        string title
        string message
        boolean isRead
        timestamp createdAt
    }
    
    AlertRule {
        uuid id PK
        string ruleName UK
        string category
        jsonb condition
        enum severity
        array notificationChannels
        boolean isActive
    }
```

## Key Relationships Summary

### One-to-One (||--||)
- User ↔ Driver
- Truck ↔ TruckSpecification

### One-to-Many (||--o{)
- User → UserRole, AuditLog, LoginHistory, Notification
- Role → UserRole, RolePermission
- Truck → Trip, PartInstallation, TyreInstallation, WorkOrder, FuelLog
- Route → RouteStop, Trip
- Trip → TripTracking, TripStop, TripIncident
- Part → PartInstallation, PartTransaction
- Tyre → TyreInstallation, TyreInspection
- MaintenancePlan → MaintenanceSchedule, MaintenancePlanTask
- WorkOrder → WorkOrderTask, WorkOrderPart
- Inspection → InspectionItem

### Many-to-Many (via Junction Tables)
- User ↔ Role (via UserRole)
- Role ↔ Permission (via RolePermission)
- Part ↔ Supplier (via PartSupplierMapping)
- MaintenancePlan ↔ Part (via MaintenancePlanPart)
- WorkOrder ↔ Part (via WorkOrderPart)

## Indexing Strategy

### Primary Keys
- All tables use UUID primary keys

### Unique Indexes
- Business keys (email, VIN, registrationNumber, licenseNumber, etc.)
- Composite unique constraints on junction tables

### Foreign Key Indexes
- All foreign keys automatically indexed

### Performance Indexes
- Timestamp fields (createdAt, updatedAt)
- Status fields for filtering
- Composite indexes for common query patterns

### Spatial Indexes
- Geography columns for location-based queries

---

This ERD provides a complete visual representation of the database schema for the Fleet Management System.
