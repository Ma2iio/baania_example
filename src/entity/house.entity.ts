import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, AfterLoad } from "typeorm";
import { Postcode } from "./postcode.entity";

@Entity('House')
export class House {

  post_code = ''

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  desc: string;

  @Column()
  price: number;

  @ManyToOne(
    () => Postcode,
    postCode => postCode.house,
  )
  postCode: Postcode

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


  @AfterLoad()
    transFormPostcode() {
      this.post_code = this.postCode?.post_code ?? ''
    }
}
