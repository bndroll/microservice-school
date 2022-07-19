import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AccountBuyCourse, AccountChangeProfile, AccountCheckPayment } from '@ms-school/contracts';
import { UserService } from './user.service';


@Controller()
export class UserCommands {
    constructor(
        private readonly userService: UserService
    ) {
    }

    @RMQValidate()
    @RMQRoute(AccountChangeProfile.topic)
    async changeProfile(@Body() {id, user}: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
        return await this.userService.changeProfile(id, user);
    }

    @RMQValidate()
    @RMQRoute(AccountBuyCourse.topic)
    async buyCourse(@Body() {userId, courseId}: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
        return await this.userService.buyCourse(userId, courseId);
    }

    @RMQValidate()
    @RMQRoute(AccountCheckPayment.topic)
    async checkPayment(@Body() {userId, courseId}: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
        return await this.userService.checkPayment(userId, courseId);
    }
}
