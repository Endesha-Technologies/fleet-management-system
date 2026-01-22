import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { PartSupplier } from "./PartSupplier";

export enum TyreStatus {
    IN_INVENTORY = "in_inventory",
    INSTALLED = "installed",
    DISPOSED = "disposed"
}

export enum TyreType {
    STEER = "steer",
    DRIVE = "drive",
    TRAILER = "trailer",
    SPARE = "spare"
}

export enum DisposalReason {
    WORN_OUT = "worn_out",
    DAMAGED = "damaged",
    PUNCTURE = "puncture",
    AGE = "age",
    WARRANTY_CLAIM = "warranty_claim"
}

export enum DisposalType {
    SCRAP = "scrap",
    RETREAD = "retread",
    RESALE = "resale",
    WARRANTY_RETURN = "warranty_return"
}

@Entity("tyres")
@Index(["tyreNumber"], { unique: true })
@Index(["serialNumber"], { unique: true, where: "serialNumber IS NOT NULL" })
export class Tyre {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    tyreNumber: string;

    @Column({ unique: true, nullable: true })
    serialNumber: string;

    @Column({ nullable: false })
    brand: string;

    @Column({ nullable: false })
    model: string;

    @Column({ nullable: false })
    size: string;

    @Column({
        type: "enum",
        enum: TyreType,
        nullable: false
    })
    tyreType: TyreType;

    @Column({ nullable: true })
    plyRating: string;

    @Column({ nullable: true })
    loadIndex: string;

    @Column({ nullable: true })
    speedRating: string;

    @Column({ type: "date", nullable: false })
    purchaseDate: Date;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    purchaseCost: number;

    @Column({ type: "uuid", nullable: true })
    supplierId: string;

    @ManyToOne(() => PartSupplier, { nullable: true })
    @JoinColumn({ name: "supplierId" })
    supplier: PartSupplier;

    @Column({ type: "int", nullable: true })
    warrantyMileage: number;

    @Column({ type: "date", nullable: true })
    warrantyExpiryDate: Date;

    @Column({
        type: "enum",
        enum: TyreStatus,
        default: TyreStatus.IN_INVENTORY
    })
    status: TyreStatus;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    totalAccumulatedMileage: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    currentTreadDepth: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: false })
    originalTreadDepth: number;

    @Column({ type: "date", nullable: true })
    disposalDate: Date;

    @Column({
        type: "enum",
        enum: DisposalReason,
        nullable: true
    })
    disposalReason: DisposalReason;

    @Column({
        type: "enum",
        enum: DisposalType,
        nullable: true
    })
    disposalType: DisposalType;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
