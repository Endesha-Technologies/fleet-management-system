import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { MaintenancePlan } from "./MaintenancePlan";
import { Truck } from "./Truck";

export enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}

export enum ScheduleStatus {
    ACTIVE = "active",
    SCHEDULED = "scheduled",
    DUE = "due",
    OVERDUE = "overdue",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

@Entity("maintenance_schedules")
@Index(["truckId", "scheduledDate"])
export class MaintenanceSchedule {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    planId: string;

    @Column({ type: "uuid" })
    truckId: string;

    @ManyToOne(() => MaintenancePlan)
    @JoinColumn({ name: "planId" })
    plan: MaintenancePlan;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ type: "date", nullable: true })
    scheduledDate: Date;

    // Baseline values (when tracking started)
    @Column({ type: "date", nullable: false })
    startDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    baselineOdometer: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    baselineEngineHours: number;

    @Column({ type: "int", nullable: true })
    baselineTripCount: number;

    // Last service values
    @Column({ type: "date", nullable: true })
    lastServiceDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    lastServiceOdometer: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    lastServiceEngineHours: number;

    @Column({ type: "int", nullable: true })
    lastServiceTripCount: number;

    // Next due values (calculated)
    @Column({ type: "date", nullable: true })
    nextDueDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    nextDueOdometer: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    nextDueEngineHours: number;

    @Column({ type: "int", nullable: true })
    nextDueTripCount: number;

    // Legacy fields (kept for backward compatibility)
    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    dueAtOdometer: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    dueAtEngineHours: number;

    @Column({
        type: "enum",
        enum: Priority,
        default: Priority.MEDIUM
    })
    priority: Priority;

    @Column({
        type: "enum",
        enum: ScheduleStatus,
        default: ScheduleStatus.ACTIVE
    })
    status: ScheduleStatus;

    @Column({ type: "uuid", nullable: true })
    workOrderId: string;

    @Column({ type: "date", nullable: true })
    completedDate: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
