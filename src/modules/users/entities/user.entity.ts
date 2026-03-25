import { Role } from "@common/enums/role.enum";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    firstName: string;

    @Column({ length: 100 })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.CASHIER
    })
    role: Role;

    @Column({ nullable: true })
    branchId: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt: Date | null;
}