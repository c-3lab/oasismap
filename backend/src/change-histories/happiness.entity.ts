import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'government', name: 'happiness' })
export class Happiness {
  @PrimaryColumn({ name: 'entityid' })
  entityId: string;

  @Column({ name: 'entitytype' })
  entityType: string;

  @Column({ name: 'fiwareservicepath' })
  fiwareServicePath: string;

  @Column({ name: 'recvtime', nullable: true })
  recvTime: Date;

  @Column()
  happiness1: number;

  @Column({ name: 'happiness1_md', nullable: true })
  happiness1Md?: string;

  @Column()
  happiness2: number;

  @Column({ name: 'happiness2_md', nullable: true })
  happiness2Md?: string;

  @Column()
  happiness3: number;

  @Column({ name: 'happiness3_md', nullable: true })
  happiness3Md?: string;

  @Column()
  happiness4: number;

  @Column({ name: 'happiness4_md', nullable: true })
  happiness4Md?: string;

  @Column()
  happiness5: number;

  @Column({ name: 'happiness5_md', nullable: true })
  happiness5Md?: string;

  @Column()
  happiness6: number;

  @Column({ name: 'happiness6_md', nullable: true })
  happiness6Md?: string;

  @Column()
  timestamp: Date;

  @Column({ name: 'timestamp_md', nullable: true })
  timestampMd?: string;

  @Column()
  nickname: string;

  @Column({ name: 'nickname_md', nullable: true })
  nicknameMd?: string;

  @Column()
  location: string;

  @Column({ name: 'location_md' })
  locationMd: string;

  @Column()
  age: string;

  @Column({ name: 'age_md', nullable: true })
  ageMd?: string;

  @Column()
  address: string;

  @Column({ name: 'address_md', nullable: true })
  addressMd?: string;

  @Column({ nullable: true })
  memo: string;

  @Column({ name: 'memo_md', nullable: true })
  memoMd?: string;
}
