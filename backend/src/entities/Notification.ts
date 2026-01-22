import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";

export enum NotificationType {
    INFO = "info",
    WARNING = "warning",
    ALERT = "alert",
    CRITICAL = "critical"
}

@Entity("notifications")
@Index(["userId", "isRead", "createdAt"])
export class Notification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({
        type: "enum",
        enum: NotificationType,
        nullable: false
    })
    notificationType: NotificationType;

    @Column({ nullable: false })
    category: string;

    @Column({ nullable: false })
    title: string;

    @Column({ type: "text", nullable: false })
    message: string;

    @Column({ nullable: true })
    entityType: string;

    @Column({ nullable: true })
    entityId: string;

    @Column({ nullable: true })
    actionUrl: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ type: "timestamp", nullable: true })
    readAt: Date;

    @Column({ type: "timestamp", nullable: true })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
