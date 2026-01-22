import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Route } from "./Route";
import { Truck } from "./Truck";
import { Driver } from "./Driver";

export enum TripStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    DELAYED = "delayed",
    CANCELLED = "cancelled"
}

@Entity()
export class Trip {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Route)
    route: Route;

    @ManyToOne(() => Truck)
    truck: Truck;

    @ManyToOne(() => Driver)
    driver: Driver;

    @Column()
    scheduledDeparture: Date;

    @Column({ nullable: true })
    scheduledArrival: Date;

    @Column({
        type: "enum",
        enum: TripStatus,
        default: TripStatus.SCHEDULED
    })
    status: TripStatus;

    // Actual metrics
    @Column({ nullable: true })
    actualDeparture: Date;

    @Column({ nullable: true })
    actualArrival: Date;

    @Column({ type: "float", nullable: true })
    actualDistanceKm: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
