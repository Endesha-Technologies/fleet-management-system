import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Part } from "./Part";
import { PartSupplier } from "./PartSupplier";

@Entity("part_supplier_mappings")
@Index(["partId", "supplierId"], { unique: true })
export class PartSupplierMapping {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    partId: string;

    @Column({ type: "uuid" })
    supplierId: string;

    @ManyToOne(() => Part)
    @JoinColumn({ name: "partId" })
    part: Part;

    @ManyToOne(() => PartSupplier)
    @JoinColumn({ name: "supplierId" })
    supplier: PartSupplier;

    @Column({ nullable: true })
    supplierPartNumber: string;

    @Column({ type: "int", nullable: true })
    leadTimeDays: number;

    @Column({ type: "int", nullable: true })
    minimumOrderQuantity: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    unitPrice: number;

    @Column({ default: "USD" })
    currency: string;

    @Column({ default: false })
    isPreferred: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
