import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

export enum DriverStatus {
    ACTIVE = "active",
    ON_TRIP = "on_trip",
    OFF_DUTY = "off_duty",
    SUSPENDED = "suspended"
}

@Entity()
export class Driver {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column()
    licenseNumber: string;

    @Column()
    licenseExpiryDate: Date;

    @Column({
        type: "enum",
        enum: DriverStatus,
        default: DriverStatus.ACTIVE
    })
    status: DriverStatus;

    @Column({ type: "int", default: 0 })
    yearsOfExperience: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
