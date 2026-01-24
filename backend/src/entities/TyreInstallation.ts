import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Tyre } from "./Tyre";
import { Truck } from "./Truck";
import { User } from "./User";

export enum WheelPosition {
    LEFT_OUTER = "left_outer",
    LEFT_INNER = "left_inner",
    RIGHT_OUTER = "right_outer",
    RIGHT_INNER = "right_inner",
    SINGLE = "single"
}

export enum TyreInstallationStatus {
    ACTIVE = "active",
    REMOVED = "removed"
}

export enum RemovalReason {
    ROTATION = "rotation",
    REPLACEMENT = "replacement",
    PUNCTURE = "puncture",
    DAMAGE = "damage",
    END_OF_LIFE = "end_of_life"
}

export enum EventType {
    INSTALLATION = "installation",
    ROTATION = "rotation",
    REMOVAL = "removal"
}

@Entity("tyre_installations")
@Index(["tyreId", "truckId"])
@Index(["truckId", "axlePosition", "wheelPosition", "status"])
@Index(["eventType", "installationDate"])
export class TyreInstallation {
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

    @Column({
        type: "enum",
        enum: EventType,
        default: EventType.INSTALLATION
    })
    eventType: EventType;

    @Column({ nullable: true })
    previousAxlePosition: string;

    @Column({
        type: "enum",
        enum: WheelPosition,
        nullable: true
    })
    previousWheelPosition: WheelPosition;

    @Column({ nullable: false })
    axlePosition: string;

    @Column({
        type: "enum",
        enum: WheelPosition,
        nullable: false
    })
    wheelPosition: WheelPosition;

    @Column({ type: "date", nullable: false })
    installationDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    odometerAtInstallation: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: false })
    treadDepthAtInstallation: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    pressureAtInstallation: number;

    @Column({ type: "uuid", nullable: true })
    installedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "installedBy" })
    installedByUser: User;

    @Column({ type: "uuid", nullable: true })
    workOrderId: string;

    @Column({ type: "date", nullable: true })
    removalDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerAtRemoval: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    treadDepthAtRemoval: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    mileageCovered: number;

    @Column({
        type: "enum",
        enum: RemovalReason,
        nullable: true
    })
    removalReason: RemovalReason;

    @Column({ type: "uuid", nullable: true })
    removedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "removedBy" })
    removedByUser: User;

    @Column({
        type: "enum",
        enum: TyreInstallationStatus,
        default: TyreInstallationStatus.ACTIVE
    })
    status: TyreInstallationStatus;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
