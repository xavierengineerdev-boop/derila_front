import { HttpStatus } from '@nestjs/common';
import { CustomException, ErrorResponse } from '../exceptions/custom-exceptions';

export class ErrorUtil {
  /**
   * Создает ошибку на основе статус-кода
   */
  static createError(
    statusCode: number,
    message: string | string[],
    error?: string,
    details?: any,
  ): CustomException {
    return new CustomException(
      statusCode as HttpStatus,
      message,
      error,
      details,
    );
  }

  /**
   * Создает стандартизированный ответ об ошибке
   */
  static formatErrorResponse(
    statusCode: number,
    message: string | string[],
    path?: string,
    details?: any,
  ): ErrorResponse {
    return {
      statusCode,
      message,
      error: this.getDefaultError(statusCode),
      timestamp: new Date().toISOString(),
      path,
      ...(details && { details }),
    };
  }

  /**
   * Получает дефолтное описание ошибки по статус-коду
   */
  static getDefaultError(statusCode: number): string {
    const errorMap: Record<number, string> = {
      // 2xx - Success
      200: 'Success',
      201: 'Created',
      204: 'No Content',

      // 3xx - Redirection
      300: 'Multiple Choices',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      307: 'Temporary Redirect',
      308: 'Permanent Redirect',

      // 4xx - Client Errors
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      409: 'Conflict',
      410: 'Gone',
      411: 'Length Required',
      412: 'Precondition Failed',
      413: 'Payload Too Large',
      414: 'URI Too Long',
      415: 'Unsupported Media Type',
      416: 'Range Not Satisfiable',
      417: 'Expectation Failed',
      422: 'Unprocessable Entity',
      423: 'Locked',
      424: 'Failed Dependency',
      425: 'Too Early',
      426: 'Upgrade Required',
      428: 'Precondition Required',
      429: 'Too Many Requests',
      431: 'Request Header Fields Too Large',
      451: 'Unavailable For Legal Reasons',

      // 5xx - Server Errors
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      505: 'HTTP Version Not Supported',
      506: 'Variant Also Negotiates',
      507: 'Insufficient Storage',
      508: 'Loop Detected',
      510: 'Not Extended',
      511: 'Network Authentication Required',
    };

    return errorMap[statusCode] || 'Unknown Error';
  }

  /**
   * Проверяет, является ли статус-код ошибкой клиента (4xx)
   */
  static isClientError(statusCode: number): boolean {
    return statusCode >= 400 && statusCode < 500;
  }

  /**
   * Проверяет, является ли статус-код ошибкой сервера (5xx)
   */
  static isServerError(statusCode: number): boolean {
    return statusCode >= 500 && statusCode < 600;
  }

  /**
   * Проверяет, является ли статус-код успешным (2xx)
   */
  static isSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  /**
   * Проверяет, является ли статус-код редиректом (3xx)
   */
  static isRedirect(statusCode: number): boolean {
    return statusCode >= 300 && statusCode < 400;
  }
}


