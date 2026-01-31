import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Route } from "./Route";
import { Truck } from "./Truck";
import { Driver } from "./Driver";
import { User } from "./User";

export enum TripStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    DELAYED = "delayed",
    CANCELLED = "cancelled"
}

@Entity("trips")
@Index(["tripNumber"], { unique: true })
@Index(["truckId", "scheduledDeparture"])
@Index(["driverId", "scheduledDeparture"])
export class Trip {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    tripNumber: string;

    @Column({ type: "uuid" })
    routeId: string;

    @Column({ type: "uuid" })
    truckId: string;

    @Column({ type: "uuid" })
    driverId: string;

    @Column({ type: "uuid", nullable: true })
    coDriverId: string;

    @ManyToOne(() => Route)
    @JoinColumn({ name: "routeId" })
    route: Route;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @ManyToOne(() => Driver)
    @JoinColumn({ name: "driverId" })
    driver: Driver;

    @ManyToOne(() => Driver, { nullable: true })
    @JoinColumn({ name: "coDriverId" })
    coDriver: Driver;

    @Column({ type: "timestamp", nullable: false })
    scheduledDeparture: Date;

    @Column({ type: "timestamp", nullable: true })
    scheduledArrival: Date;

    @Column({ type: "timestamp", nullable: true })
    actualDeparture: Date;

    @Column({ type: "timestamp", nullable: true })
    actualArrival: Date;

    @Column({
        type: "enum",
        enum: TripStatus,
        default: TripStatus.SCHEDULED
    })
    status: TripStatus;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerStart: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerEnd: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    engineHoursStart: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    engineHoursEnd: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    actualDistanceKm: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    actualEngineHours: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    averageSpeedKmh: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    fuelConsumedLitres: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    cargoWeight: number;

    @Column({ type: "text", nullable: true })
    cargoDescription: string;

    @Column({ nullable: true })
    clientName: string;

    @Column({ nullable: true })
    deliveryNoteNumber: string;

    @Column({ type: "text", nullable: true })
    cancellationReason: string;

    @Column({ type: "text", nullable: true })
    delayReason: string;

    @Column({ type: "text", nullable: true })
    notes: string;

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
