import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { Role } from "./Role";
import { Permission } from "./Permission";

@Entity("role_permissions")
@Index(["roleId", "permissionId"], { unique: true })
export class RolePermission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    roleId: string;

    @Column({ type: "uuid" })
    permissionId: string;

    @ManyToOne(() => Role, role => role.rolePermissions)
    @JoinColumn({ name: "roleId" })
    role: Role;

    @ManyToOne(() => Permission, permission => permission.rolePermissions)
    @JoinColumn({ name: "permissionId" })
    permission: Permission;

    @CreateDateColumn()
    createdAt: Date;
}
