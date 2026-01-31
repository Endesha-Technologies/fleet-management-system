import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from "typeorm";
import { RolePermission } from "./RolePermission";

@Entity("permissions")
@Index(["code"], { unique: true })
@Index(["resource", "action"], { unique: true })
export class Permission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    code: string; // e.g., "user:create", "truck:read"

    @Column({ nullable: false })
    name: string; // e.g., "Create Users", "View Trucks"

    @Column({ nullable: false })
    resource: string; // e.g., "user", "truck", "trip"

    @Column({ nullable: false })
    action: string; // e.g., "create", "read", "update", "delete"

    @Column({ type: "text", nullable: true })
    description: string;

    @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
    rolePermissions: RolePermission[];

    @CreateDateColumn()
    createdAt: Date;
}
