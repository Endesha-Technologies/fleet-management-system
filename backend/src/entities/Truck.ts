import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum TruckStatus {
    ACTIVE = "active",
    MAINTENANCE = "maintenance",
    ON_TRIP = "on_trip",
    OUT_OF_SERVICE = "out_of_service"
}

@Entity()
export class Truck {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    registrationNumber: string;

    @Column({ unique: true })
    vin: string;

    @Column()
    make: string;

    @Column()
    model: string;

    @Column()
    year: number;

    @Column()
    fuelType: string;

    @Column({ type: "float", default: 0 })
    currentMileage: number;

    @Column({
        type: "enum",
        enum: TruckStatus,
        default: TruckStatus.ACTIVE
    })
    status: TruckStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
