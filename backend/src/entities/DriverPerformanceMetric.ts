import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { Driver } from "./Driver";

@Entity("driver_performance_metrics")
@Index(["driverId", "periodStart", "periodEnd"], { unique: true })
export class DriverPerformanceMetric {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    driverId: string;

    @ManyToOne(() => Driver)
    @JoinColumn({ name: "driverId" })
    driver: Driver;

    @Column({ type: "date", nullable: false })
    periodStart: Date;

    @Column({ type: "date", nullable: false })
    periodEnd: Date;

    @Column({ type: "int", default: 0 })
    totalTrips: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalDistanceKm: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalDrivingHours: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    averageFuelEfficiency: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    safetyScore: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    onTimeDeliveryRate: number;

    @Column({ type: "int", default: 0 })
    incidentCount: number;

    @Column({ type: "timestamp" })
    calculatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
