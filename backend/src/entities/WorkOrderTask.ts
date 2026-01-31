import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { WorkOrder } from "./WorkOrder";
import { User } from "./User";

export enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    SKIPPED = "skipped"
}

@Entity("work_order_tasks")
export class WorkOrderTask {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    workOrderId: string;

    @ManyToOne(() => WorkOrder)
    @JoinColumn({ name: "workOrderId" })
    workOrder: WorkOrder;

    @Column({ type: "int", nullable: true })
    taskSequence: number;

    @Column({ nullable: false })
    taskName: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({
        type: "enum",
        enum: TaskStatus,
        default: TaskStatus.PENDING
    })
    status: TaskStatus;

    @Column({ type: "uuid", nullable: true })
    performedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "performedBy" })
    performedByUser: User;

    @Column({ type: "timestamp", nullable: true })
    startedAt: Date;

    @Column({ type: "timestamp", nullable: true })
    completedAt: Date;

    @Column({ type: "int", nullable: true })
    durationMinutes: number;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
