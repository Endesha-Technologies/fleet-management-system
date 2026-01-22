import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import { RolePermission } from "./RolePermission";
import { UserRole } from "./UserRole";

@Entity("roles")
@Index(["name"], { unique: true })
export class Role {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ default: false })
    isSystem: boolean;

    @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
    permissions: RolePermission[];

    @OneToMany(() => UserRole, userRole => userRole.role)
    userRoles: UserRole[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
