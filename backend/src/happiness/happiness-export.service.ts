import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Happiness } from './happiness.entity';
import { DateTime } from 'luxon';
import Papa from 'papaparse';

@Injectable()
export class HappinessExportService {
  constructor(
    @InjectRepository(Happiness)
    private happinessRepository: Repository<Happiness>,
  ) {}

  async exportCsv(): Promise<Uint8Array> {
    const records = await this.happinessRepository.find({
      order: {
        timestamp: 'ASC',
      },
    });

    const csvData = records.map((record) => {
      const jsonLocation = JSON.parse(record.location);
      const jsonLocationMd = JSON.parse(record.locationMd);
      const timestamp = DateTime.fromJSDate(record.timestamp)
        .setZone('Asia/Tokyo')
        .toFormat('yyyy-MM-dd HH:mm:ss');

      return {
        ニックネーム: record.nickname,
        年代: record.age,
        住所: record.address,
        送信日時: timestamp,
        緯度: jsonLocation.coordinates[1],
        経度: jsonLocation.coordinates[0],
        送信住所: jsonLocationMd[0].value,
        happiness1: record.happiness1,
        happiness2: record.happiness2,
        happiness3: record.happiness3,
        happiness4: record.happiness4,
        happiness5: record.happiness5,
        happiness6: record.happiness6,
        メモ: record.memo,
      };
    });

    const csvString = Papa.unparse(csvData, {
      header: true,
      quotes: false,
      escapeChar: '\\',
      delimiter: ',',
      newline: '\n',
      skipEmptyLines: true,
      escapeFormulae: true,
    });

    // UTF-8 BOM
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

    return new Uint8Array([...bom, ...new TextEncoder().encode(csvString)]);
  }
}
