import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Truck } from "./Truck";
import { User } from "./User";

export enum DocumentType {
    REGISTRATION = "registration",
    INSURANCE = "insurance",
    PERMIT = "permit",
    FITNESS = "fitness",
    ROADTAX = "roadtax",
    OTHER = "other"
}

@Entity("truck_documents")
@Index(["truckId", "documentType"])
export class TruckDocument {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    truckId: string;

    @ManyToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({
        type: "enum",
        enum: DocumentType,
        nullable: false
    })
    documentType: DocumentType;

    @Column({ nullable: true })
    documentNumber: string;

    @Column({ type: "date", nullable: true })
    issueDate: Date;

    @Column({ type: "date", nullable: true })
    expiryDate: Date;

    @Column({ nullable: false })
    documentUrl: string;

    @Column({ type: "uuid" })
    uploadedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "uploadedBy" })
    uploadedByUser: User;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
