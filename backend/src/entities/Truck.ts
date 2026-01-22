import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "typeorm";

export enum TruckStatus {
    ACTIVE = "active",
    MAINTENANCE = "maintenance",
    ON_TRIP = "on_trip",
    OUT_OF_SERVICE = "out_of_service",
    SOLD = "sold",
    SCRAPPED = "scrapped"
}

export enum FuelType {
    DIESEL = "diesel",
    PETROL = "petrol",
    CNG = "cng",
    LNG = "lng",
    ELECTRIC = "electric",
    HYBRID = "hybrid"
}

export enum Ownership {
    OWNED = "owned",
    LEASED = "leased",
    RENTED = "rented"
}

@Entity("trucks")
@Index(["registrationNumber"], { unique: true })
@Index(["vin"], { unique: true })
export class Truck {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    registrationNumber: string;

    @Column({ unique: true, nullable: false })
    vin: string;

    @Column({ nullable: false })
    make: string;

    @Column({ nullable: false })
    model: string;

    @Column({ type: "int", nullable: false })
    year: number;

    @Column({ nullable: true })
    color: string;

    @Column({
        type: "enum",
        enum: FuelType,
        nullable: false
    })
    fuelType: FuelType;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    fuelCapacityLitres: number;

    @Column({ unique: true, nullable: true })
    engineNumber: string;

    @Column({ nullable: true })
    chassisNumber: string;

    @Column({ type: "date", nullable: true })
    purchaseDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    purchasePrice: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    currentOdometer: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    currentEngineHours: number;

    @Column({
        type: "enum",
        enum: TruckStatus,
        default: TruckStatus.ACTIVE
    })
    status: TruckStatus;

    @Column({
        type: "enum",
        enum: Ownership,
        default: Ownership.OWNED
    })
    ownership: Ownership;

    @Column({ nullable: true })
    insurancePolicyNumber: string;

    @Column({ type: "date", nullable: true })
    insuranceExpiryDate: Date;

    @Column({ type: "date", nullable: true })
    roadTaxExpiryDate: Date;

    @Column({ type: "date", nullable: true })
    fitnessExpiryDate: Date;

    @Column({ type: "date", nullable: true })
    permitExpiryDate: Date;

    @Column({ unique: true, nullable: true })
    gprsDeviceId: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
