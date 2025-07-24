import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { HappinessEntity, OrionEntity } from './interface/happiness-entity';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { InjectRepository } from '@nestjs/typeorm';
import { Happiness } from './happiness.entity';
import { Repository } from 'typeorm';
import Papa from 'papaparse';
import { HappinessImportResponse } from './interface/happiness-import.response';
import { Answer, ImportHappinessDto } from './dto/create-happiness.dto';
import { validateOrReject } from 'class-validator';

const expectedHeaders = [
  'ニックネーム',
  '年代',
  '住所',
  '送信日時',
  '緯度',
  '経度',
  '送信住所',
  'happiness1',
  'happiness2',
  'happiness3',
  'happiness4',
  'happiness5',
  'happiness6',
  'メモ',
] as const;

type HappinessCSVHeaderKey = (typeof expectedHeaders)[number];

type HappinessCsvRow = Record<HappinessCSVHeaderKey, string>;

@Injectable()
export class HappinessImportService {
  constructor(
    @InjectRepository(Happiness)
    private happinessRepository: Repository<Happiness>,
  ) {}

  async importCsv(
    csvFile: Express.Multer.File,
    isRefresh: boolean,
  ): Promise<HappinessImportResponse> {
    if (isRefresh) {
      await this.deleteAllEntities();
      await this.happinessRepository.clear();
    }

    try {
      const results = await this.parseCsv(csvFile.buffer.toString('utf8'));
      if (results.errors.length > 0) {
        throw 'CSV parse is failed.';
      }

      if (!this.correctHeaders(results.meta.fields)) {
        throw 'CSV header row is incorrect.';
      }

      if (results.data.length > 0) {
        await this.validateHappinessCsvRows(results.data);
        await this.postHappinessEntities(this.toPostEntities(results.data));
      }

      const happinessImportResponse: HappinessImportResponse = {
        message: 'CSV records have been imported.',
        imported_records: results.data.length,
      };

      return happinessImportResponse;
    } catch (err) {
      console.error(err);
      throw new BadRequestException(err);
    }
  }

  private async parseCsv(stream): Promise<Papa.ParseResult<HappinessCsvRow>> {
    return new Promise((resolve) => {
      Papa.parse<HappinessCsvRow>(stream, {
        header: true,
        skipEmptyLines: true,
        complete: (results, _file) => {
          resolve(results);
        },
      });
    });
  }

  private async deleteAllEntities() {
    while (true) {
      const entities = await this.getEntities();

      if (entities.length === 0) return;

      await axios.post(
        `${process.env.ORION_URI}/v2/op/update`,
        { actionType: 'delete', entities: entities },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
    }
  }

  private async getEntities(): Promise<OrionEntity[]> {
    const response = await axios.get(`${process.env.ORION_URI}/v2/entities`, {
      headers: {
        'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
        'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
      },
      params: {
        type: 'happiness',
        attrs: '__NONE',
        limit: '1000',
      },
    });
    return response.data;
  }

  private correctHeaders(headers: string[]): boolean {
    const requiredHeaders = expectedHeaders.filter(
      (header) => header !== 'メモ',
    );
    return requiredHeaders.every((header) => headers.includes(header));
  }

  private async validateHappinessCsvRows(
    rows: HappinessCsvRow[],
  ): Promise<void> {
    await Promise.all(
      rows.map(async (row, index) => {
        try {
          const answer = new Answer();
          answer.happiness1 = Number(row['happiness1']);
          answer.happiness2 = Number(row['happiness2']);
          answer.happiness3 = Number(row['happiness3']);
          answer.happiness4 = Number(row['happiness4']);
          answer.happiness5 = Number(row['happiness5']);
          answer.happiness6 = Number(row['happiness6']);

          const happiness = new ImportHappinessDto();
          happiness.timestamp = row['送信日時'];
          happiness.latitude = Number(row['緯度']);
          happiness.longitude = Number(row['経度']);
          happiness.memo = row['メモ'];
          happiness.answers = answer;
          await validateOrReject(happiness);
        } catch (error) {
          console.debug(`Validation error at row ${index + 2}: ${error}`);
          throw error;
        }
      }),
    );
  }

  private toPostEntities(rows: HappinessCsvRow[]): HappinessEntity[] {
    return rows.map((row) => {
      const id = uuidv4();
      return this.toPostEntity(id, row);
    });
  }

  private toPostEntity(
    id: string,
    happinessCsvRow: HappinessCsvRow,
  ): HappinessEntity {
    const formattedData: HappinessEntity = {
      id: id,
      type: 'happiness',
      happiness1: {
        type: 'Number',
        value: Number(happinessCsvRow['happiness1']),
      },
      happiness2: {
        type: 'Number',
        value: Number(happinessCsvRow['happiness2']),
      },
      happiness3: {
        type: 'Number',
        value: Number(happinessCsvRow['happiness3']),
      },
      happiness4: {
        type: 'Number',
        value: Number(happinessCsvRow['happiness4']),
      },
      happiness5: {
        type: 'Number',
        value: Number(happinessCsvRow['happiness5']),
      },
      happiness6: {
        type: 'Number',
        value: Number(happinessCsvRow['happiness6']),
      },
      timestamp: {
        type: 'DateTime',
        value: this.parseDate(happinessCsvRow['送信日時']).toISO(),
      },
      nickname: {
        type: 'Text',
        value: happinessCsvRow['ニックネーム'],
      },
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [
            Number(happinessCsvRow['経度']),
            Number(happinessCsvRow['緯度']),
          ],
        },
        metadata: {
          place: {
            type: 'Text',
            value: happinessCsvRow['送信住所'],
          },
        },
      },
      age: {
        type: 'Text',
        value: happinessCsvRow['年代'],
      },
      address: {
        type: 'Text',
        value: happinessCsvRow['住所'],
      },
      memo: {
        type: 'Text',
        value: happinessCsvRow['メモ'] ?? '',
      },
    };

    return formattedData;
  }

  private parseDate(dateString: string): DateTime {
    return DateTime.fromFormat(dateString, 'yyyy-MM-dd HH:mm:ss', {
      zone: 'Asia/Tokyo',
    });
  }

  private async postHappinessEntities(entities: HappinessEntity[]) {
    // 1000件ずつに分割して処理する
    for (let i = 0; i < entities.length; i += 500) {
      const chunk = entities.slice(i, i + 500);

      await axios.post(
        `${process.env.ORION_URI}/v2/op/update`,
        { actionType: 'append_strict', entities: chunk },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
    }
  }
}
