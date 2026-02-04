import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";
import { UserRole } from "./UserRole";
import { AuditLog } from "./AuditLog";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ select: false, nullable: false })
    passwordHash: string;

    // Virtual property for convenience
    password?: string;

    @Column({ nullable: false })
    firstName: string;

    @Column({ nullable: false })
    lastName: string;

    @Column({ nullable: true })
    phoneNumber: string | null;

    // Alias for convenience
    get phone(): string | null {
        return this.phoneNumber;
    }

    set phone(value: string | null) {
        this.phoneNumber = value;
    }

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ type: "timestamp", nullable: true })
    lastLoginAt: Date;

    @Column({ type: "timestamp", nullable: true })
    passwordChangedAt: Date;

    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles: UserRole[];

    // Virtual property for convenience
    get roles(): UserRole[] {
        return this.userRoles;
    }

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
