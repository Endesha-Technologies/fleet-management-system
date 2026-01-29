import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { Truck } from "./Truck";

export enum RotationPattern {
  CROSS = "cross",
  FRONT_TO_BACK = "front-to-back",
  SIDE_TO_SIDE = "side-to-side",
  CUSTOM = "custom",
}

export enum TyrePosition {
  FRONT_LEFT = "front-left",
  FRONT_RIGHT = "front-right",
  REAR_LEFT = "rear-left",
  REAR_RIGHT = "rear-right",
  SPARE = "spare",
}

@Entity("tyre_rotation_schedules")
@Index(["truckId"])
@Index(["nextDueDate"])
export class TyreRotationSchedule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  truckId: string;

  @ManyToOne(() => Truck)
  @JoinColumn({ name: "truckId" })
  truck: Truck;

  @Column({ type: "enum", enum: RotationPattern })
  rotationPattern: RotationPattern;

  @Column({ type: "datetime" })
  nextDueDate: Date;

  @Column({ type: "int" })
  nextDueMileage: number;

  @Column({ type: "int" })
  currentMileage: number;

  @Column({ type: "int" })
  intervalDays: number;

  @Column({ type: "int" })
  intervalMileage: number;

  @Column({ type: "datetime", nullable: true })
  lastRotationDate: Date | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity("tyre_rotations")
@Index(["truckId"])
@Index(["rotationDate"])
@Index(["status"])
export class TyreRotation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  truckId: string;

  @ManyToOne(() => Truck)
  @JoinColumn({ name: "truckId" })
  truck: Truck;

  @Column({ type: "datetime" })
  rotationDate: Date;

  @Column({ type: "int" })
  mileage: number;

  @Column({ type: "enum", enum: RotationPattern })
  rotationPattern: RotationPattern;

  @Column({ type: "varchar" })
  performedBy: string;

  @Column({ type: "simple-json" })
  tyreMovements: TyreMovementData[];

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({ type: "enum", enum: ["completed", "scheduled", "cancelled"], default: "scheduled" })
  status: "completed" | "scheduled" | "cancelled";

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Store tyre movement details in JSON
export interface TyreMovementData {
  tyreId: string;
  tyreName?: string;
  fromPosition: TyrePosition;
  toPosition: TyrePosition;
  beforeTreadDepth: number;
  afterTreadDepth?: number;
  wearPercentage: number;
}
