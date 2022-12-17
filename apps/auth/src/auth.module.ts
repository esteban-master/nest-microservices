import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user';

import { hashSync } from 'bcrypt';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';
// import { ClientsModule, Transport } from '@nestjs/microservices';
// import { NatsJetStreamTransport } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
// import { NatsJetStreamClient, NatsJetStreamTransport } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
// import { ClientsModule, Transport } from '@nestjs/microservices';
// import { NatsJetStreamClient, NatsJetStreamTransport } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre('save', async function (next) {
            if (this.isModified('password')) {
              this.password = hashSync(this.password, 10);
              next();
            }
            next();
          });

          return schema;
        },
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
    // NatsJetStreamTransport.register({
    //   connectionOptions: {
    //     servers: ['http://nats-srv:4222'],
    //     name: 'auth-service',
    //   },
    // }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['http://nats-srv:4222'],
          queue: 'auth-queue',
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JWTStrategy],
})
export class AuthModule {}
