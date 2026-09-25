import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const response = exception.getResponse();

    this.logger.error(`Bad request: ${JSON.stringify(response)}`);

    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    res.status(exception.getStatus()).json(response);
  }
}
