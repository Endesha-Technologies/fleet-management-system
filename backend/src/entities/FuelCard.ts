import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Truck } from "./Truck";
import { Driver } from "./Driver";

@Entity("fuel_cards")
@Index(["cardNumber"], { unique: true })
export class FuelCard {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    cardNumber: string;

    @Column({ nullable: false })
    cardProvider: string;

    @Column({ type: "uuid", nullable: true })
    truckId: string;

    @Column({ type: "uuid", nullable: true })
    driverId: string;

    @ManyToOne(() => Truck, { nullable: true })
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @ManyToOne(() => Driver, { nullable: true })
    @JoinColumn({ name: "driverId" })
    driver: Driver;

    @Column({ type: "date", nullable: false })
    issueDate: Date;

    @Column({ type: "date", nullable: false })
    expiryDate: Date;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyLimit: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    monthlyLimit: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "timestamp", nullable: true })
    suspendedAt: Date;

    @Column({ type: "text", nullable: true })
    suspensionReason: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
