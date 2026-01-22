import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Truck } from "./Truck";
import { Trip } from "./Trip";
import { Driver } from "./Driver";
import { User } from "./User";

export enum BreakdownType {
    MECHANICAL = "mechanical",
    ELECTRICAL = "electrical",
    TYRE = "tyre",
    ACCIDENT = "accident",
    OTHER = "other"
}

export enum Severity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}

export enum BreakdownStatus {
    REPORTED = "reported",
    ACKNOWLEDGED = "acknowledged",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed"
}

@Entity("breakdowns")
@Index(["breakdownNumber"], { unique: true })
@Index(["truckId", "occurredAt"])
export class Breakdown {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    breakdownNumber: string;

    @Column({ type: "uuid" })
    truckId: string;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ type: "uuid", nullable: true })
    tripId: string;

    @ManyToOne(() => Trip, { nullable: true })
    @JoinColumn({ name: "tripId" })
    trip: Trip;

    @Column({ type: "uuid", nullable: true })
    driverId: string;

    @ManyToOne(() => Driver, { nullable: true })
    @JoinColumn({ name: "driverId" })
    driver: Driver;

    @Column({ type: "timestamp", nullable: false })
    occurredAt: Date;

    @Column({ type: "timestamp", nullable: false })
    reportedAt: Date;

    @Column({ type: "uuid" })
    reportedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "reportedBy" })
    reportedByUser: User;

    @Column({ nullable: true })
    locationName: string;

    @Column({ type: "geography", spatialFeatureType: "Point", srid: 4326, nullable: true })
    locationCoords: string;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerReading: number;

    @Column({
        type: "enum",
        enum: BreakdownType,
        nullable: false
    })
    breakdownType: BreakdownType;

    @Column({
        type: "enum",
        enum: Severity,
        nullable: false
    })
    severity: Severity;

    @Column({ type: "text", nullable: false })
    symptomDescription: string;

    @Column({ default: false })
    isOperational: boolean;

    @Column({ default: false })
    requiresTowing: boolean;

    @Column({ type: "uuid", nullable: true })
    workOrderId: string;

    @Column({ type: "timestamp", nullable: true })
    resolvedAt: Date;

    @Column({ type: "int", nullable: true })
    resolutionTime: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    downTimeHours: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    estimatedRepairCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    actualRepairCost: number;

    @Column({
        type: "enum",
        enum: BreakdownStatus,
        default: BreakdownStatus.REPORTED
    })
    status: BreakdownStatus;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
