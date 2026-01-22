import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Truck } from "./Truck";
import { Driver } from "./Driver";
import { Trip } from "./Trip";
import { User } from "./User";

export enum FuelTypeEnum {
    DIESEL = "diesel",
    PETROL = "petrol",
    CNG = "cng",
    LNG = "lng",
    ELECTRIC = "electric"
}

export enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    FLEET_CARD = "fleet_card",
    ACCOUNT = "account"
}

@Entity("fuel_logs")
@Index(["logNumber"], { unique: true })
@Index(["truckId", "filledAt"])
@Index(["driverId", "filledAt"])
export class FuelLog {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    logNumber: string;

    @Column({ type: "uuid" })
    truckId: string;

    @Column({ type: "uuid" })
    driverId: string;

    @Column({ type: "uuid", nullable: true })
    tripId: string;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @ManyToOne(() => Driver)
    @JoinColumn({ name: "driverId" })
    driver: Driver;

    @ManyToOne(() => Trip, { nullable: true })
    @JoinColumn({ name: "tripId" })
    trip: Trip;

    @Column({
        type: "enum",
        enum: FuelTypeEnum,
        nullable: false
    })
    fuelType: FuelTypeEnum;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    amountLitres: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    costPerLitre: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    totalCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    odometerReading: number;

    @Column({ type: "timestamp", nullable: false })
    filledAt: Date;

    @Column({ nullable: false })
    locationName: string;

    @Column({ type: "geography", spatialFeatureType: "Point", srid: 4326, nullable: true })
    locationCoords: string;

    @Column({ nullable: true })
    fuelStationName: string;

    @Column({ nullable: true })
    receiptNumber: string;

    @Column({
        type: "enum",
        enum: PaymentMethod,
        nullable: false
    })
    paymentMethod: PaymentMethod;

    @Column({ default: false })
    isFullTank: boolean;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    previousOdometerReading: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    distanceSinceLastFill: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    fuelEfficiency: number;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ type: "uuid", nullable: true })
    recordedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "recordedBy" })
    recordedByUser: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
