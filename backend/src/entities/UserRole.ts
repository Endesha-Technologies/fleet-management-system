import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";
import { Role } from "./Role";

@Entity("user_roles")
@Index(["userId", "roleId"], { unique: true })
export class UserRole {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    userId: string;

    @Column({ type: "uuid" })
    roleId: string;

    @Column({ type: "uuid", nullable: true })
    assignedBy: string;

    @ManyToOne(() => User, user => user.userRoles)
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(() => Role, role => role.userRoles)
    @JoinColumn({ name: "roleId" })
    role: Role;

    @ManyToOne(() => User)
    @JoinColumn({ name: "assignedBy" })
    assignedByUser: User;

    @CreateDateColumn()
    assignedAt: Date;
}
