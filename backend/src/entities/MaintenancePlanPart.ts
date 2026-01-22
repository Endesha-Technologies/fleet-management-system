import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { MaintenancePlan } from "./MaintenancePlan";
import { Part } from "./Part";

@Entity("maintenance_plan_parts")
@Index(["planId", "partId"], { unique: true })
export class MaintenancePlanPart {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    planId: string;

    @Column({ type: "uuid" })
    partId: string;

    @ManyToOne(() => MaintenancePlan)
    @JoinColumn({ name: "planId" })
    plan: MaintenancePlan;

    @ManyToOne(() => Part)
    @JoinColumn({ name: "partId" })
    part: Part;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    quantityRequired: number;

    @Column({ default: false })
    isOptional: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
