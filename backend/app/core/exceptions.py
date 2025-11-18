"""
Custom exceptions for the application
"""
from fastapi import HTTPException, status


class CheckinSystemException(Exception):
    """Base exception for the checkin system."""
    pass


class UserNotFoundException(CheckinSystemException):
    """Raised when a user is not found."""
    pass


class ProjectNotFoundException(CheckinSystemException):
    """Raised when a project is not found."""
    pass


class ClientNotFoundException(CheckinSystemException):
    """Raised when a client is not found."""
    pass


class ActiveCheckinExistsException(CheckinSystemException):
    """Raised when trying to start a new checkin while one is already active."""
    pass


class NoActiveCheckinException(CheckinSystemException):
    """Raised when trying to end a checkin that doesn't exist or isn't active."""
    pass


class UnauthorizedException(CheckinSystemException):
    """Raised when user doesn't have permission to perform an action."""
    pass


class InvalidCredentialsException(CheckinSystemException):
    """Raised when login credentials are invalid."""
    pass


class FileUploadException(CheckinSystemException):
    """Raised when file upload fails."""
    pass


class ValidationException(CheckinSystemException):
    """Raised when data validation fails."""
    pass


# HTTP Exception helpers
def user_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Usuário não encontrado"
    )


def project_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Projeto não encontrado"
    )


def client_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Cliente não encontrado"
    )


def active_checkin_exists():
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Você já possui um check-in ativo. Finalize-o antes de iniciar um novo."
    )


def no_active_checkin():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Nenhum check-in ativo encontrado"
    )


def unauthorized():
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Não autorizado para esta operação"
    )


def invalid_credentials():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email ou senha inválidos",
        headers={"WWW-Authenticate": "Bearer"}
    )


def file_too_large():
    return HTTPException(
        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        detail="Arquivo muito grande. Tamanho máximo: 10MB"
    )


def invalid_file_type():
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Tipo de arquivo não permitido"
    )