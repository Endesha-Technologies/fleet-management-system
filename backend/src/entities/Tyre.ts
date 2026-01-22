import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Truck } from "./Truck";

export enum TyreStatus {
    IN_INVENTORY = "in_inventory",
    INSTALLED = "installed",
    DISPOSED = "disposed"
}

@Entity()
export class Tyre {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    serialNumber: string; // DOT number

    @Column()
    brand: string;

    @Column()
    model: string;

    @Column()
    size: string;

    @Column()
    type: string; // steer, drive, trailer, etc.

    @Column()
    purchaseDate: Date;

    @Column({ type: "float" })
    purchaseCost: number;

    @Column({
        type: "enum",
        enum: TyreStatus,
        default: TyreStatus.IN_INVENTORY
    })
    status: TyreStatus;

    @Column({ type: "float", default: 0 })
    totalAccumulatedMileage: number;

    @Column({ type: "float" })
    currentTreadDepth: number;

    // Installation details (nullable if in inventory)
    @ManyToOne(() => Truck, { nullable: true })
    currentTruck: Truck;

    @Column({ nullable: true })
    currentAxle: string;

    @Column({ nullable: true })
    currentPosition: string; // e.g., "Front-Left"

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
