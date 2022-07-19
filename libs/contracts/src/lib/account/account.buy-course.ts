import { IsString } from 'class-validator';


export namespace AccountBuyCourse {
    export const topic = 'account.buy-course.query';

    export class Request {
        @IsString()
        courseId: string;

        @IsString()
        userId: string;
    }

    export class Response {
        paymentLink: string;
    }
}
