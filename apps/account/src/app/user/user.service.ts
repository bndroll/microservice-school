import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQService } from 'nestjs-rmq';
import { UserEventEmitter } from './user.event-emitter';
import { UserEntity } from './entities/user.entity';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { IUser } from '@ms-school/interfaces';


@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly rmqService: RMQService,
        private readonly userEventEmitter: UserEventEmitter
    ) {
    }

    async changeProfile(id: string, user: Pick<IUser, 'displayName'>) {
        const existedUser = await this.userRepository.findUserById(id);

        if (!existedUser) {
            throw new Error('Такого пользователя не существует');
        }

        const userEntity = new UserEntity(existedUser).updateProfile(user.displayName);
        await this.updateUser(userEntity);
        return {};
    }

    async buyCourse(userId: string, courseId: string) {
        const existedUser = await this.userRepository.findUserById(userId);

        if (!existedUser) {
            throw new Error('Такого пользователя не существует');
        }

        const userEntity = new UserEntity(existedUser);
        const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
        const {user, paymentLink} = await saga.getState().pay();
        await this.updateUser(user);
        return {paymentLink};
    }

    async checkPayment(userId: string, courseId: string) {
        const existedUser = await this.userRepository.findUserById(userId);

        if (!existedUser) {
            throw new Error('Такого пользователя не существует');
        }

        const userEntity = new UserEntity(existedUser);
        const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
        const {user, status} = await saga.getState().checkPayment();
        await this.updateUser(user);
        return {status};
    }

    private updateUser(user: UserEntity) {
        return Promise.all([
            this.userEventEmitter.handle(user),
            this.userRepository.updateUser(user)
        ]);
    }
}
