import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Truck } from "./Truck";

export enum PartStatus {
    IN_STOCK = "in_stock",
    INSTALLED = "installed",
    SOLD = "sold",
    DISPOSED = "disposed"
}

@Entity()
export class Part {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    partNumber: string;

    @Column({ nullable: true })
    serialNumber: string;

    @Column()
    category: string; // engine, electrical, etc.

    @Column({
        type: "enum",
        enum: PartStatus,
        default: PartStatus.IN_STOCK
    })
    status: PartStatus;

    @Column({ type: "float", default: 0 })
    cost: number;

    // Current location
    @ManyToOne(() => Truck, { nullable: true })
    currentTruck: Truck;

    @Column({ type: "int", default: 0 })
    quantity: number; // For consumables, otherwise 1 for serialized parts

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
