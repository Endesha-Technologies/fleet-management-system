import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Tyre } from "./Tyre";
import { Truck } from "./Truck";
import { User } from "./User";

export enum VisualCondition {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    CRITICAL = "critical"
}

export enum PassFail {
    PASS = "pass",
    FAIL = "fail"
}

@Entity("tyre_inspections")
export class TyreInspection {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    tyreId: string;

    @Column({ type: "uuid", nullable: true })
    truckId: string;

    @ManyToOne(() => Tyre)
    @JoinColumn({ name: "tyreId" })
    tyre: Tyre;

    @ManyToOne(() => Truck, { nullable: true })
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ type: "date", nullable: false })
    inspectionDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerReading: number;

    @Column({ type: "uuid" })
    inspectedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "inspectedBy" })
    inspectedByUser: User;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: false })
    treadDepth: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: false })
    pressure: number;

    @Column({
        type: "enum",
        enum: VisualCondition,
        nullable: false
    })
    visualCondition: VisualCondition;

    @Column({ default: true })
    hasUniformWear: boolean;

    @Column({ default: false })
    hasCuts: boolean;

    @Column({ default: false })
    hasCracks: boolean;

    @Column({ default: false })
    hasBulges: boolean;

    @Column({ default: false })
    hasEmbeddedObjects: boolean;

    @Column({ default: false })
    alignmentIssues: boolean;

    @Column({
        type: "enum",
        enum: PassFail,
        nullable: false
    })
    passFail: PassFail;

    @Column({ type: "text", nullable: true })
    actionRequired: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;
}
