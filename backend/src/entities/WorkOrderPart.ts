import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { WorkOrder } from "./WorkOrder";
import { Part } from "./Part";
import { User } from "./User";

export enum PartRequestStatus {
    REQUESTED = "requested",
    RESERVED = "reserved",
    ISSUED = "issued",
    RETURNED = "returned"
}

@Entity("work_order_parts")
export class WorkOrderPart {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    workOrderId: string;

    @Column({ type: "uuid" })
    partId: string;

    @ManyToOne(() => WorkOrder)
    @JoinColumn({ name: "workOrderId" })
    workOrder: WorkOrder;

    @ManyToOne(() => Part)
    @JoinColumn({ name: "partId" })
    part: Part;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    quantityRequested: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    quantityUsed: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    unitCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    totalCost: number;

    @Column({
        type: "enum",
        enum: PartRequestStatus,
        default: PartRequestStatus.REQUESTED
    })
    status: PartRequestStatus;

    @Column({ type: "uuid", nullable: true })
    issuedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "issuedBy" })
    issuedByUser: User;

    @Column({ type: "timestamp", nullable: true })
    issuedAt: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
