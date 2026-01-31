import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";

@Entity("login_history")
@Index(["userId", "attemptedAt"])
@Index(["ipAddress", "attemptedAt"])
export class LoginHistory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid", nullable: true })
    userId: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    success: boolean;

    @Column({ nullable: true })
    failureReason: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ type: "text", nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    deviceType: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    sessionId: string;

    @Column({ type: "timestamp", nullable: true })
    loggedOutAt: Date;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "userId" })
    user: User;

    @CreateDateColumn()
    attemptedAt: Date;
}
