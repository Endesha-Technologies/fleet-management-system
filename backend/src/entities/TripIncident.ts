import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Trip } from "./Trip";
import { User } from "./User";

export enum IncidentType {
    ACCIDENT = "accident",
    BREAKDOWN = "breakdown",
    DELAY = "delay",
    TRAFFIC = "traffic",
    WEATHER = "weather",
    THEFT = "theft",
    OTHER = "other"
}

export enum Severity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}

@Entity("trip_incidents")
export class TripIncident {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    tripId: string;

    @ManyToOne(() => Trip)
    @JoinColumn({ name: "tripId" })
    trip: Trip;

    @Column({
        type: "enum",
        enum: IncidentType,
        nullable: false
    })
    incidentType: IncidentType;

    @Column({
        type: "enum",
        enum: Severity,
        nullable: false
    })
    severity: Severity;

    @Column({ nullable: true })
    locationName: string;

    @Column({ type: "geography", spatialFeatureType: "Point", srid: 4326, nullable: true })
    locationCoords: string;

    @Column({ type: "timestamp", nullable: false })
    occurredAt: Date;

    @Column({ type: "text", nullable: false })
    description: string;

    @Column({ type: "text", nullable: true })
    actionTaken: string;

    @Column({ type: "uuid", nullable: true })
    reportedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "reportedBy" })
    reportedByUser: User;

    @Column({ nullable: true })
    policeReportNumber: string;

    @Column({ nullable: true })
    insuranceClaimNumber: string;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    estimatedCost: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    actualCost: number;

    @Column({ default: false })
    resolved: boolean;

    @Column({ type: "timestamp", nullable: true })
    resolvedAt: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
