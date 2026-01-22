import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { Trip } from "./Trip";

@Entity("trip_tracking")
@Index(["tripId", "recordedAt"])
export class TripTracking {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    tripId: string;

    @ManyToOne(() => Trip)
    @JoinColumn({ name: "tripId" })
    trip: Trip;

    @Column({ type: "decimal", precision: 10, scale: 7, nullable: false })
    latitude: number;

    @Column({ type: "decimal", precision: 10, scale: 7, nullable: false })
    longitude: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    altitude: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    speed: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    heading: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    accuracy: number;

    @Column({ type: "timestamp", nullable: false })
    recordedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
