import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";

export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}

@Entity("system_logs")
@Index(["logLevel", "timestamp"])
@Index(["service", "timestamp"])
export class SystemLog {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: LogLevel,
        nullable: false
    })
    logLevel: LogLevel;

    @Column({ nullable: false })
    service: string;

    @Column({ nullable: true })
    module: string;

    @Column({ type: "text", nullable: false })
    message: string;

    @Column({ type: "text", nullable: true })
    stackTrace: string;

    @Column({ type: "jsonb", nullable: true })
    context: any;

    @Column({ type: "uuid", nullable: true })
    userId: string;

    @Column({ nullable: true })
    requestId: string;

    @Column({ nullable: true })
    ipAddress: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "userId" })
    user: User;

    @CreateDateColumn()
    timestamp: Date;
}
