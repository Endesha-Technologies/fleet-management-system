import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Truck } from "./Truck";
import { Driver } from "./Driver";
import { Trip } from "./Trip";

@Entity()
export class FuelLog {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Truck)
    truck: Truck;

    @ManyToOne(() => Driver)
    driver: Driver;

    @ManyToOne(() => Trip, { nullable: true })
    trip: Trip;

    @Column({ type: "float" })
    amountLitres: number;

    @Column({ type: "float" })
    costTotal: number;

    @Column({ type: "float" })
    odometerReading: number;

    @Column()
    location: string;

    @Column()
    fuelType: string;

    @Column()
    date: Date;

    @CreateDateColumn()
    createdAt: Date;
}
