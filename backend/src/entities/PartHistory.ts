import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { Part } from "./Part";
import { Truck } from "./Truck";
import { User } from "./User";

export enum TransactionType {
    PURCHASE = "purchase",
    SALE = "sale",
    INSTALL = "install",
    REMOVE = "remove",
    DISPOSAL = "disposal",
    ADJUSTMENT = "adjustment",
    RETURN = "return",
    TRANSFER = "transfer"
}

@Entity("part_transactions")
@Index(["partId", "transactionDate"])
export class PartTransaction {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    partId: string;

    @ManyToOne(() => Part)
    @JoinColumn({ name: "partId" })
    part: Part;

    @Column({
        type: "enum",
        enum: TransactionType,
        nullable: false
    })
    transactionType: TransactionType;

    @Column({ type: "int", nullable: false })
    quantityChange: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    unitPrice: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    totalCost: number;

    @Column({ nullable: true })
    fromLocation: string;

    @Column({ nullable: true })
    toLocation: string;

    @Column({ type: "uuid", nullable: true })
    truckId: string;

    @ManyToOne(() => Truck, { nullable: true })
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ type: "uuid", nullable: true })
    workOrderId: string;

    @Column({ nullable: true })
    referenceNumber: string;

    @Column({ type: "uuid" })
    performedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "performedBy" })
    performedByUser: User;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ type: "timestamp", nullable: false })
    transactionDate: Date;

    @CreateDateColumn()
    createdAt: Date;
}
