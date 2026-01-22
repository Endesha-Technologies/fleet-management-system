import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Truck } from "./Truck";
import { Tyre } from "./Tyre";
import { User } from "./User";

export enum WheelPosition {
    LEFT_OUTER = "left_outer",
    LEFT_INNER = "left_inner",
    RIGHT_OUTER = "right_outer",
    RIGHT_INNER = "right_inner",
    SINGLE = "single"
}

@Entity("tyre_position_changes")
export class TyrePositionChange {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    tyreId: string;

    @Column({ type: "uuid" })
    truckId: string;

    @ManyToOne(() => Tyre)
    @JoinColumn({ name: "tyreId" })
    tyre: Tyre;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ nullable: false })
    fromAxlePosition: string;

    @Column({
        type: "enum",
        enum: WheelPosition,
        nullable: false
    })
    fromWheelPosition: WheelPosition;

    @Column({ nullable: false })
    toAxlePosition: string;

    @Column({
        type: "enum",
        enum: WheelPosition,
        nullable: false
    })
    toWheelPosition: WheelPosition;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    treadDepthBefore: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    treadDepthAfter: number;

    @Column({ type: "date", nullable: false })
    changeDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    odometerReading: number;

    @Column({ nullable: true })
    reason: string;

    @Column({ type: "uuid" })
    performedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "performedBy" })
    performedByUser: User;

    @Column({ type: "uuid", nullable: true })
    workOrderId: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;
}
