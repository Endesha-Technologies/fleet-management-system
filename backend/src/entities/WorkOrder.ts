import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Truck } from "./Truck";
import { User } from "./User";

export enum WorkOrderStatus {
    DRAFT = "draft",
    APPROVED = "approved",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    VERIFIED = "verified",
    CLOSED = "closed"
}

export enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}

@Entity()
export class WorkOrder {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Truck)
    truck: Truck;

    @Column()
    title: string;

    @Column("text")
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

    @ManyToOne(() => User, { nullable: true })
    assignedTechnician: User;

    @Column({ type: "float", nullable: true })
    estimatedCost: number;

    @Column({ type: "float", nullable: true })
    actualCostLabor: number;

    @Column({ type: "float", nullable: true })
    actualCostParts: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
