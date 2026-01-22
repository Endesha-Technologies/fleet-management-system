import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Truck } from "./Truck";
import { User } from "./User";
import { MaintenanceSchedule } from "./MaintenanceSchedule";

export enum WorkOrderStatus {
    DRAFT = "draft",
    APPROVED = "approved",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    VERIFIED = "verified",
    CLOSED = "closed",
    CANCELLED = "cancelled"
}

export enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}

export enum MaintenanceTypeEnum {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    INSPECTION = "inspection",
    BREAKDOWN = "breakdown",
    REGULATORY = "regulatory"
}

@Entity("work_orders")
@Index(["workOrderNumber"], { unique: true })
@Index(["truckId", "status"])
export class WorkOrder {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    workOrderNumber: string;

    @Column({ type: "uuid" })
    truckId: string;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({
        type: "enum",
        enum: MaintenanceTypeEnum,
        nullable: false
    })
    maintenanceType: MaintenanceTypeEnum;

    @Column({ type: "uuid", nullable: true })
    maintenanceScheduleId: string;

    @ManyToOne(() => MaintenanceSchedule, { nullable: true })
    @JoinColumn({ name: "maintenanceScheduleId" })
    maintenanceSchedule: MaintenanceSchedule;

    @Column({ nullable: false })
    title: string;

    @Column({ type: "text", nullable: false })
    description: string;

    @Column({
        type: "enum",
        enum: Priority,
        default: Priority.MEDIUM
    })
    priority: Priority;

    @Column({
        type: "enum",
        enum: WorkOrderStatus,
        default: WorkOrderStatus.DRAFT
    })
    status: WorkOrderStatus;

    @Column({ type: "uuid", nullable: true })
    reportedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "reportedBy" })
    reportedByUser: User;

    @Column({ type: "uuid", nullable: true })
    assignedTo: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "assignedTo" })
    assignedTechnician: User;

    @Column({ type: "uuid", nullable: true })
    approvedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "approvedBy" })
    approvedByUser: User;

    @Column({ type: "timestamp", nullable: true })
    approvedAt: Date;

    @Column({ type: "date", nullable: true })
    scheduledStartDate: Date;

    @Column({ type: "date", nullable: true })
    actualStartDate: Date;

    @Column({ type: "date", nullable: true })
    scheduledEndDate: Date;

    @Column({ type: "date", nullable: true })
    actualEndDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerAtStart: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerAtEnd: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    laborCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    partsCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    externalServiceCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    totalCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    estimatedCost: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    downTimeHours: number;

    @Column({ nullable: true })
    failureCategory: string;

    @Column({ type: "text", nullable: true })
    rootCause: string;

    @Column({ type: "text", nullable: true })
    resolution: string;

    @Column({ type: "text", nullable: true })
    preventiveAction: string;

    @Column({ default: false })
    requiresFollowUp: boolean;

    @Column({ type: "date", nullable: true })
    followUpDate: Date;

    @Column({ type: "uuid", nullable: true })
    verifiedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "verifiedBy" })
    verifiedByUser: User;

    @Column({ type: "timestamp", nullable: true })
    verifiedAt: Date;

    @Column({ type: "uuid", nullable: true })
    closedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "closedBy" })
    closedByUser: User;

    @Column({ type: "timestamp", nullable: true })
    closedAt: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
