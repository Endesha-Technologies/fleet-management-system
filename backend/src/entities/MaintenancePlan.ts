import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./User";

export enum AssetType {
    TRUCK = "truck",
    TRAILER = "trailer",
    EQUIPMENT = "equipment"
}

export enum MaintenanceType {
    PREVENTIVE = "preventive",
    INSPECTION = "inspection",
    REGULATORY = "regulatory"
}

export enum TriggerType {
    MILEAGE = "mileage",
    ENGINE_HOURS = "engine_hours",
    TIME_DAYS = "time_days",
    TIME_MONTHS = "time_months",
    TRIP_COUNT = "trip_count",
    COMBINED = "combined"
}

export enum CombinedTriggerLogic {
    OR = "or",
    AND = "and"
}

@Entity("maintenance_plans")
@Index(["planCode"], { unique: true })
export class MaintenancePlan {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    planCode: string;

    @Column({ nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({
        type: "enum",
        enum: AssetType,
        nullable: false
    })
    assetType: AssetType;

    @Column({
        type: "enum",
        enum: MaintenanceType,
        nullable: false
    })
    maintenanceType: MaintenanceType;

    @Column({
        type: "enum",
        enum: TriggerType,
        nullable: false
    })
    triggerType: TriggerType;

    @Column({ type: "int", nullable: true })
    triggerValue: number;

    @Column({ type: "jsonb", nullable: true })
    combinedTriggers: {
        logic: CombinedTriggerLogic;
        conditions: Array<{
            triggerType: TriggerType;
            triggerValue: number;
        }>;
    };

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    estimatedDurationHours: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    estimatedCost: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "uuid", nullable: true })
    createdBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "createdBy" })
    createdByUser: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
