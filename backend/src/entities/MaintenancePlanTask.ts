import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { MaintenancePlan } from "./MaintenancePlan";

export enum TaskCategory {
    INSPECTION = "inspection",
    SERVICE = "service",
    REPLACEMENT = "replacement",
    REPAIR = "repair",
    CLEANING = "cleaning",
    TESTING = "testing"
}

@Entity("maintenance_plan_tasks")
@Index(["planId", "taskSequence"], { unique: true })
export class MaintenancePlanTask {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    planId: string;

    @ManyToOne(() => MaintenancePlan)
    @JoinColumn({ name: "planId" })
    plan: MaintenancePlan;

    @Column({ type: "int", nullable: false })
    taskSequence: number;

    @Column({ nullable: false })
    taskName: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({
        type: "enum",
        enum: TaskCategory,
        nullable: false
    })
    category: TaskCategory;

    @Column({ type: "int", nullable: true })
    estimatedDurationMinutes: number;

    @Column({ default: false })
    requiresSpecialist: boolean;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
