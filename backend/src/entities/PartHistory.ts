import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Part } from "./Part";
import { Truck } from "./Truck";
import { User } from "./User";

export enum PartAction {
    PURCHASE = "purchase",
    INSTALL = "install",
    REMOVE = "remove",
    SALE = "sale",
    DISPOSAL = "disposal"
}

@Entity()
export class PartHistory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Part)
    part: Part;

    @ManyToOne(() => Truck, { nullable: true })
    truck: Truck;

    @ManyToOne(() => User)
    performedBy: User;

    @Column({
        type: "enum",
        enum: PartAction
    })
    action: PartAction;

    @Column({ type: "float", nullable: true })
    odometerReading: number;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn()
    timestamp: Date;
}
