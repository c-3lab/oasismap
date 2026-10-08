import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { ValidationExceptionFilter } from './validation-exception.filter';
import { afterEach } from 'node:test';

describe('ValidationExceptionFilter', () => {
  let filter: ValidationExceptionFilter;
  let errorSpy: jest.SpyInstance;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new ValidationExceptionFilter();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => Logger);

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ status: mockStatus }),
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log the bad request and respond with HTTP 400', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      message: ['field is invalid'],
      error: 'Bad Request',
    });
    const expectedResponse = exception.getResponse();

    filter.catch(exception, mockHost);

    expect(errorSpy).toHaveBeenCalledWith(
      `Bad request: ${JSON.stringify(expectedResponse)}`,
    );
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(expectedResponse);
  });
});
