import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum TriggerType {
    MILEAGE = "mileage",
    TIME_MONTHS = "time_months",
    ENGINE_HOURS = "engine_hours"
}

@Entity()
export class MaintenancePlan {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    assetType: string; // truck, trailer, etc.

    @Column({
        type: "enum",
        enum: TriggerType
    })
    triggerType: TriggerType;

    @Column({ type: "int" })
    triggerValue: number; // e.g. 10000 km or 6 months

    @Column("text")
    tasks: string; // JSON or description of tasks

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
