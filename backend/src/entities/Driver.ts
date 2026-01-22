import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, Index } from "typeorm";
import { User } from "./User";

export enum DriverStatus {
    ACTIVE = "active",
    ON_TRIP = "on_trip",
    OFF_DUTY = "off_duty",
    ON_LEAVE = "on_leave",
    SUSPENDED = "suspended",
    TERMINATED = "terminated"
}

export enum CertificationStatus {
    VALID = "valid",
    EXPIRED = "expired",
    SUSPENDED = "suspended"
}

export interface DriverCertificationData {
    certificationType: string;
    certificationNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    issuingAuthority?: string;
    documentUrl?: string;
    status: CertificationStatus;
}

@Entity("drivers")
@Index(["licenseNumber"], { unique: true })
@Index(["employeeNumber"], { unique: true })
export class Driver {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid", unique: true })
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({ unique: true, nullable: true })
    employeeNumber: string;

    @Column({ unique: true, nullable: false })
    licenseNumber: string;

    @Column({ nullable: false })
    licenseClass: string;

    @Column({ type: "date", nullable: true })
    licenseIssueDate: Date;

    @Column({ type: "date", nullable: false })
    licenseExpiryDate: Date;

    @Column({ nullable: true })
    licenseIssuingCountry: string;

    @Column({ type: "jsonb", nullable: false, default: '[]' })
    certifications: DriverCertificationData[];

    @Column({ type: "date", nullable: true })
    dateOfBirth: Date;

    @Column({ nullable: true })
    bloodGroup: string;

    @Column({ nullable: true })
    emergencyContactName: string;

    @Column({ nullable: true })
    emergencyContactPhone: string;

    @Column({
        type: "enum",
        enum: DriverStatus,
        default: DriverStatus.ACTIVE
    })
    status: DriverStatus;

    @Column({ type: "int", default: 0 })
    yearsOfExperience: number;

    @Column({ type: "date", nullable: true })
    hireDate: Date;

    @Column({ type: "date", nullable: true })
    terminationDate: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
