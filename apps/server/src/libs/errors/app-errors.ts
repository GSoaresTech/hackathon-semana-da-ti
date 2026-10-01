class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class BadRequestError extends AppError {
  constructor(message?: string) {
    super(message || 'Solicitação inválida', 400);
  }
}

class InvalidCredentialsError extends AppError {
  constructor() {
    super('Credenciais inválidas, tente novamente', 401);
  }
}

class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(message || 'Não autenticado', 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message?: string) {
    super(message || 'Recurso não encontrado', 404);
  }
}

class AlreadyExistsError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

class InternalServerError extends AppError {
  constructor(message?: string) {
    super(message || 'Erro interno do servidor', 500);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message?: string) {
    super(message || 'Serviço indisponível no momento', 503);
  }
}

export {
  AlreadyExistsError,
  AppError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  InvalidCredentialsError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
};
