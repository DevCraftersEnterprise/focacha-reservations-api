import { ReservationStatus } from '@common/enums/reservation-status.enum';
import { Branch } from '@modules/branches/entities/branch.entity';
import { User } from '@modules/users/entities/user.entity';
import { Zone } from '@modules/zones/entities/zone.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  reservationDate: string;

  @Column({ type: 'time' })
  reservationTime: string;

  @Column({ type: 'integer' })
  guestCount: number;

  @Column({ type: 'varchar', length: 150 })
  eventType: string;

  @Column({ type: 'varchar', length: 150 })
  customerName: string;

  @Column({ type: 'varchar', length: 20 })
  phonePrimary: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneSecondary: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @Column({ type: 'varchar' })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'varchar', nullable: false })
  zoneId: string;

  @ManyToOne(() => Zone, { nullable: false })
  @JoinColumn({ name: 'zoneId' })
  zone: Zone;

  @Column({ type: 'varchar' })
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;

  @Column({ type: 'varchar', nullable: true })
  updatedByUserId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedByUserId' })
  updatedByUser: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cancellationReason: string | null;

  @Column({ type: 'varchar', nullable: true })
  cancelledByUserId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelledByUserId' })
  cancelledByUser: User | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
