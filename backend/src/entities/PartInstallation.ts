import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Part } from "./Part";
import { Truck } from "./Truck";
import { User } from "./User";

export enum InstallationStatus {
    INSTALLED = "installed",
    REMOVED = "removed"
}

@Entity("part_installations")
@Index(["partId", "truckId"])
export class PartInstallation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    partId: string;

    @Column({ type: "uuid" })
    truckId: string;

    @ManyToOne(() => Part)
    @JoinColumn({ name: "partId" })
    part: Part;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ type: "date", nullable: false })
    installationDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    odometerAtInstallation: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    engineHoursAtInstallation: number;

    @Column({ type: "uuid", nullable: true })
    installedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "installedBy" })
    installedByUser: User;

    @Column({ type: "uuid", nullable: true })
    workOrderId: string;

    @Column({ type: "date", nullable: true })
    warrantyStartDate: Date;

    @Column({ type: "date", nullable: true })
    warrantyEndDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    expectedReplacementMileage: number;

    @Column({ type: "date", nullable: true })
    removalDate: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    odometerAtRemoval: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    engineHoursAtRemoval: number;

    @Column({ nullable: true })
    removalReason: string;

    @Column({ type: "uuid", nullable: true })
    removedBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "removedBy" })
    removedByUser: User;

    @Column({
        type: "enum",
        enum: InstallationStatus,
        default: InstallationStatus.INSTALLED
    })
    status: InstallationStatus;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
