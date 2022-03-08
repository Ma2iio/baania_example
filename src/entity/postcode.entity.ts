import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { House } from "./house.entity";

@Entity('Postcode')
export class Postcode {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    unique: true
  })
  post_code: string;

  @OneToMany(() => House, house => house.postCode)
  house: House[]

  @Column("date", {
    name: "createdAt",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  createdAt: Date;

  @Column("date", {
    name: "updatedAt",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updatedAt: Date;

  @Column("date", {
    name: "deletedAt",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  deletedAt: Date;
}
