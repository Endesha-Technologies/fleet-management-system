import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "typeorm";
import { User } from "./User";

export enum RouteType {
    SHORT_HAUL = "short_haul",
    LONG_HAUL = "long_haul",
    REGIONAL = "regional",
    INTERNATIONAL = "international"
}

export enum StopType {
    WAYPOINT = "waypoint",
    REST_AREA = "rest_area",
    FUEL_STATION = "fuel_station",
    CHECKPOINT = "checkpoint",
    DELIVERY_POINT = "delivery_point"
}

export interface RouteStopData {
    stopSequence: number;
    locationName: string;
    locationCoords?: { latitude: number; longitude: number };
    stopType: StopType;
    estimatedArrivalMinutes?: number;
    plannedStayMinutes?: number;
    notes?: string;
}

@Entity("routes")
@Index(["routeCode"], { unique: true })
export class Route {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    routeCode: string;

    @Column({ nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ nullable: false })
    startLocationName: string;

    @Column({ type: "geography", spatialFeatureType: "Point", srid: 4326, nullable: true })
    startLocationCoords: string;

    @Column({ nullable: false })
    endLocationName: string;

    @Column({ type: "geography", spatialFeatureType: "Point", srid: 4326, nullable: true })
    endLocationCoords: string;

    @Column({ type: "jsonb", nullable: false, default: '[]' })
    stops: RouteStopData[];

    @Column({
        type: "enum",
        enum: RouteType,
        default: RouteType.REGIONAL
    })
    routeType: RouteType;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    estimatedDistanceKm: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    estimatedDurationHours: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "uuid", nullable: true })
    createdBy: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "createdBy" })
    createdByUser: User;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
