import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Truck } from "./Truck";
import { Driver } from "./Driver";
import { User } from "./User";
import { Trip } from "./Trip";

export enum InspectionType {
    PRE_TRIP = "pre_trip",
    POST_TRIP = "post_trip",
    PERIODIC = "periodic",
    SAFETY = "safety",
    REGULATORY = "regulatory"
}

export enum InspectionResult {
    PASS = "pass",
    PASS_WITH_NOTES = "pass_with_notes",
    FAIL = "fail"
}

export enum OverallCondition {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    CRITICAL = "critical"
}

export enum CheckResult {
    OK = "ok",
    MINOR_ISSUE = "minor_issue",
    MAJOR_ISSUE = "major_issue",
    CRITICAL = "critical",
    NOT_APPLICABLE = "not_applicable"
}

export enum ItemCondition {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    FAILED = "failed"
}

export interface InspectionItemData {
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

@Entity("inspections")
@Index(["inspectionNumber"], { unique: true })
@Index(["truckId", "actualDate"])
export class Inspection {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    inspectionNumber: string;

    @Column({
        type: "enum",
        enum: InspectionType,
        nullable: false
    })
    inspectionType: InspectionType;

    @Column({ type: "uuid" })
    truckId: string;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ type: "uuid", nullable: true })
    driverId: string;

    @ManyToOne(() => Driver, { nullable: true })
    @JoinColumn({ name: "driverId" })
    driver: Driver;

    @Column({ type: "uuid" })
    inspectorId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "inspectorId" })
    inspector: User;

    @Column({ type: "uuid", nullable: true })
    tripId: string;

    @ManyToOne(() => Trip, { nullable: true })
    @JoinColumn({ name: "tripId" })
    trip: Trip;

    @Column({ type: "date", nullable: true })
    scheduledDate: Date;

    @Column({ type: "date", nullable: false })
    actualDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerReading: number;

    @Column({ nullable: true })
    location: string;

    @Column({
        type: "enum",
        enum: InspectionResult,
        nullable: false
    })
    overallResult: InspectionResult;

    @Column({
        type: "enum",
        enum: OverallCondition,
        nullable: false
    })
    overallCondition: OverallCondition;

    @Column({ type: "int", default: 0 })
    defectsCount: number;

    @Column({ type: "int", default: 0 })
    criticalDefectsCount: number;

    @Column({ type: "jsonb", nullable: false, default: '[]' })
    items: InspectionItemData[];

    @Column({ default: false })
    workOrderCreated: boolean;

    @Column({ type: "uuid", nullable: true })
    workOrderId: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ type: "date", nullable: true })
    nextInspectionDue: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
