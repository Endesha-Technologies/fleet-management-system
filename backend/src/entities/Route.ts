import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum RouteType {
    SHORT_HAUL = "short_haul",
    LONG_HAUL = "long_haul",
    REGIONAL = "regional",
    INTERNATIONAL = "international"
}

@Entity()
export class Route {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    startLocation: string;

    @Column()
    endLocation: string;

    @Column("simple-array", { nullable: true })
    stops: string[];

    @Column({ type: "float" })
    estimatedDistanceKm: number;

    @Column({ type: "float" })
    estimatedDurationHours: number;

    @Column({
        type: "enum",
        enum: RouteType,
        default: RouteType.REGIONAL
    })
    type: RouteType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
