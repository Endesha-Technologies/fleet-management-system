import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    ADMIN = "admin",
    FLEET_MANAGER = "fleet_manager",
    DRIVER = "driver",
    MECHANIC = "mechanic"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    passwordHash: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.DRIVER
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
