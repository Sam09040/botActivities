import { CsvInputModel } from "@domain/model";
import { FileUpload } from "graphql-upload-ts";
import { Service } from "typedi";
import csv from 'csv-parser';
import { InvalidDataError } from "@core/error";

@Service()
export class CsvService {
    async validate(file: FileUpload): Promise<CsvInputModel[]> {
        const fileStream = file.createReadStream();
        const rows: CsvInputModel[] = [];

        return new Promise((resolve, reject) => {
            fileStream
            .pipe(csv())
            .on('data', (data: CsvInputModel) => {
                rows.push(data);
            })
            .on('end', () => {
                resolve(rows);
            })
            .on('error', (error) => {
                reject(new InvalidDataError('The file is invalid or contains errors.', error));
            });
        });
    }
}
