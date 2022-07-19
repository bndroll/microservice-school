import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './configs/mongo.config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';


@Module({
    imports: [
        MongooseModule.forRootAsync(getMongoConfig()),
        RMQModule.forRootAsync(getRMQConfig()),
        UserModule,
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: 'envs/.account.env'
        })],
})
export class AppModule {}
