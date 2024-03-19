import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'goverment', name: 'happiness' })
export class Happiness {
  @PrimaryGeneratedColumn({ name: 'entityid' })
  entityId: string;

  @Column()
  happiness1: number;

  @Column()
  happiness2: number;

  @Column()
  happiness3: number;

  @Column()
  happiness4: number;

  @Column()
  happiness5: number;

  @Column()
  happiness6: number;

  @Column()
  timestamp: Date;

  @Column()
  nickname: string;

  @Column()
  location: string;

  @Column({ name: 'location_md' })
  locationMd: string;

  @Column()
  age: string;

  @Column()
  address: string;
}
