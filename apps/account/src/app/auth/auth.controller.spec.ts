import { AccountLogin, AccountRegister } from '@ms-school/contracts';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { Test, TestingModule } from '@nestjs/testing';
import { getMongoConfig } from '../configs/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth.module';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';


const authLogin: AccountLogin.Request = {
    email: 'test@gmail.com',
    password: 'test'
};

const authRegister: AccountRegister.Request = {
    ...authLogin,
    displayName: 'test name'
};

describe('AuthController', () => {
    let app: INestApplication;
    let userRepository: UserRepository;
    let rmqService: RMQTestService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({isGlobal: true, envFilePath: 'envs/.account.env'}),
                RMQModule.forTest({}),
                UserModule,
                AuthModule,
                MongooseModule.forRootAsync(getMongoConfig())
            ]
        }).compile();

        app = module.createNestApplication();
        userRepository = app.get<UserRepository>(UserRepository);
        rmqService = app.get(RMQService);
        await app.init();
    });

    it('Register', async () => {
        const res = await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(AccountRegister.topic, authRegister);
        expect(res.email).toEqual(authRegister.email);
    });

    it('Login', async () => {
        const res = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(AccountLogin.topic, authLogin);
        expect(res.access_token).toBeDefined();
    });

    afterAll(async () => {
        await userRepository.deleteUserByEmail(authRegister.email);
        await app.close();
    });
});
