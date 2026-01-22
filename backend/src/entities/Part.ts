import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "typeorm";

export enum PartStatus {
    ACTIVE = "active",
    DISCONTINUED = "discontinued",
    OUT_OF_STOCK = "out_of_stock"
}

export enum PartCategory {
    ENGINE = "engine",
    TRANSMISSION = "transmission",
    BRAKES = "brakes",
    ELECTRICAL = "electrical",
    SUSPENSION = "suspension",
    BODY = "body",
    TYRES = "tyres",
    FILTERS = "filters",
    FLUIDS = "fluids",
    OTHER = "other"
}

@Entity("parts")
@Index(["partNumber"], { unique: true })
@Index(["serialNumber"], { unique: true, where: "serialNumber IS NOT NULL" })
export class Part {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    partNumber: string;

    @Column({ nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({
        type: "enum",
        enum: PartCategory,
        nullable: false
    })
    category: PartCategory;

    @Column({ nullable: true })
    manufacturer: string;

    @Column({ nullable: true })
    supplierPartNumber: string;

    @Column({ default: false })
    isSerializedAsset: boolean;

    @Column({ unique: true, nullable: true })
    serialNumber: string;

    @Column({ default: "pieces" })
    unitOfMeasure: string;

    @Column({ type: "int", default: 0 })
    minStockLevel: number;

    @Column({ type: "int", default: 0 })
    maxStockLevel: number;

    @Column({ type: "int", default: 0 })
    reorderPoint: number;

    @Column({ type: "int", default: 0 })
    quantityInStock: number;

    @Column({ type: "int", default: 0 })
    quantityReserved: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    unitCost: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    averageCost: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    lastPurchasePrice: number;

    @Column({ type: "date", nullable: true })
    lastPurchaseDate: Date;

    @Column({ type: "int", nullable: true })
    warrantyMonths: number;

    @Column({ type: "int", nullable: true })
    warrantyMileage: number;

    @Column({
        type: "enum",
        enum: PartStatus,
        default: PartStatus.ACTIVE
    })
    status: PartStatus;

    @Column({ nullable: true })
    location: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
