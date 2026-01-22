import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

export enum FuelTypeEnum {
    DIESEL = "diesel",
    PETROL = "petrol",
    CNG = "cng",
    LNG = "lng"
}

@Entity("fuel_price_history")
@Index(["fuelType", "effectiveFrom"])
export class FuelPriceHistory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: FuelTypeEnum,
        nullable: false
    })
    fuelType: FuelTypeEnum;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    pricePerLitre: number;

    @Column({ nullable: true })
    locationName: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;

    @Column({ type: "date", nullable: false })
    effectiveFrom: Date;

    @Column({ type: "date", nullable: true })
    effectiveTo: Date;

    @Column({ nullable: true })
    source: string;

    @CreateDateColumn()
    createdAt: Date;
}
