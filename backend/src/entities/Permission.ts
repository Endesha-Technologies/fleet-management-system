import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from "typeorm";
import { RolePermission } from "./RolePermission";

@Entity("permissions")
@Index(["resource", "action"], { unique: true })
export class Permission {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    resource: string;

    @Column({ nullable: false })
    action: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
    rolePermissions: RolePermission[];

    @CreateDateColumn()
    createdAt: Date;
}
