import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Trip } from "./Trip";

export enum TripStopType {
    PLANNED = "planned",
    UNPLANNED = "unplanned",
    EMERGENCY = "emergency",
    FUEL = "fuel",
    REST = "rest",
    DELIVERY = "delivery"
}

@Entity("trip_stops")
export class TripStop {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    tripId: string;

    @ManyToOne(() => Trip)
    @JoinColumn({ name: "tripId" })
    trip: Trip;

    @Column({ nullable: false })
    locationName: string;

    @Column({ type: "geography", spatialFeatureType: "Point", srid: 4326, nullable: true })
    locationCoords: string;

    @Column({ type: "timestamp", nullable: false })
    arrivalTime: Date;

    @Column({ type: "timestamp", nullable: true })
    departureTime: Date;

    @Column({ type: "int", nullable: true })
    durationMinutes: number;

    @Column({
        type: "enum",
        enum: TripStopType,
        nullable: false
    })
    stopType: TripStopType;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;
}
