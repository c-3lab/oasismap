import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Happiness } from './happiness.entity';
import { DateTime } from 'luxon';

@Injectable()
export class HappinessExportService {
  constructor(
    @InjectRepository(Happiness)
    private happinessRepository: Repository<Happiness>,
  ) {}

  async exportCsv(): Promise<Uint8Array> {
    const records = await this.happinessRepository.find();

    const csvData = records.map((record) => {
      const jsonLocation = JSON.parse(record.location);
      const jsonLocationMd = JSON.parse(record.locationMd);
      const timestamp = DateTime.fromJSDate(record.timestamp)
        .setZone('Asia/Tokyo')
        .toFormat('yyyy-MM-dd HH:mm:ss');

      const row = [
        record.nickname,
        record.age,
        record.address,
        timestamp,
        jsonLocation.coordinates[1],
        jsonLocation.coordinates[0],
        jsonLocationMd[0].value,
        record.happiness1,
        record.happiness2,
        record.happiness3,
        record.happiness4,
        record.happiness5,
        record.happiness6,
      ];
      return row.join(',');
    });

    const header =
      'ニックネーム,年代,住所,送信日時,送信緯度,送信経度,送信住所,happiness1,happiness2,happiness3,happiness4,happiness5,happiness6\n';
    const csvString = header + csvData.join('\n');

    // UTF-8 BOM
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

    return new Uint8Array([...bom, ...new TextEncoder().encode(csvString)]);
  }
}
