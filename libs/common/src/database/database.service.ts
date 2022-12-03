import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class DatabaseService implements MongooseOptionsFactory {
  protected readonly logger = new Logger(DatabaseService.name);
  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions():
    | MongooseModuleOptions
    | Promise<MongooseModuleOptions> {
    this.logger.log(
      `Connected MONGODB: ${this.configService.get('MONGO_URI')}`,
    );
    return {
      uri: this.configService.get('MONGO_URI'),
    };
  }
}
