import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Truck } from "./Truck";

@Entity("truck_specifications")
export class TruckSpecification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid", unique: true })
    truckId: string;

    @OneToOne(() => Truck)
    @JoinColumn({ name: "truckId" })
    truck: Truck;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    grossVehicleWeight: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    cargoCapacityKg: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    cargoVolumeCubicMeters: number;

    @Column({ type: "int", nullable: true })
    numberOfAxles: number;

    @Column({ type: "int", nullable: true })
    numberOfWheels: number;

    @Column({ nullable: true })
    tyreSize: string;

    @Column({ nullable: true })
    transmissionType: string;

    @Column({ type: "int", nullable: true })
    engineCapacityCC: number;

    @Column({ type: "int", nullable: true })
    horsePower: number;

    @Column({ type: "jsonb", nullable: true })
    dimensions: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
