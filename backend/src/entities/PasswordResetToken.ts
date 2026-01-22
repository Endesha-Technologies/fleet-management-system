import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";

@Entity("password_reset_tokens")
@Index(["token"], { unique: true })
@Index(["userId", "expiresAt"])
export class PasswordResetToken {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    userId: string;

    @Column({ unique: true, nullable: false })
    token: string;

    @Column({ type: "timestamp", nullable: false })
    expiresAt: Date;

    @Column({ type: "timestamp", nullable: true })
    usedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
