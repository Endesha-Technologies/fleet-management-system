import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";

@Entity("audit_logs")
@Index(["userId", "timestamp"])
@Index(["entityType", "entityId", "timestamp"])
@Index(["timestamp"])
export class AuditLog {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    userId: string;

    @Column({ nullable: false })
    userName: string;

    @Column({ nullable: false })
    action: string;

    @Column({ nullable: false })
    entityType: string;

    @Column({ nullable: false })
    entityId: string;

    @Column({ nullable: false })
    moduleName: string;

    @Column({ type: "jsonb", nullable: true })
    oldValues: any;

    @Column({ type: "jsonb", nullable: true })
    newValues: any;

    @Column({ type: "jsonb", nullable: true })
    changes: any;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ type: "text", nullable: true })
    userAgent: string;

    @Column({ default: true })
    success: boolean;

    @Column({ type: "text", nullable: true })
    errorMessage: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @CreateDateColumn()
    timestamp: Date;
}
