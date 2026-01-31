import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./User";

export enum AlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}

export interface AlertRecipientsData {
    roles?: string[];
    userIds?: string[];
}

@Entity("alert_rules")
@Index(["ruleName"], { unique: true })
export class AlertRule {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    ruleName: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ nullable: false })
    category: string;

    @Column({ type: "jsonb", nullable: false })
    condition: any;

    @Column({
        type: "enum",
        enum: AlertSeverity,
        default: AlertSeverity.MEDIUM
    })
    severity: AlertSeverity;

    @Column({ type: "jsonb", nullable: false, default: '{"channels": ["email"]}' })
    notification: {
        channels: string[];
        recipients: AlertRecipientsData;
    };

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "int", default: 60 })
    cooldownMinutes: number;

    @Column({ type: "timestamp", nullable: true })
    lastTriggeredAt: Date;

    @Column({ type: "int", default: 0 })
    triggerCount: number;

    @Column({ type: "uuid", nullable: true })
    createdBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "createdBy" })
    createdByUser: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
