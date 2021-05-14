# Censys exceptions
class CensysTenableException(Exception):
    """Base Exception raised for errors in Censys Tenable integration."""

    def __init__(self, message=None):
        self.message = message or "Error: Censys ASM assets not exported into Tenable"
        super().__init__(self.message)


class MissingCensysAPIKeyError(CensysTenableException):
    """Exception raised when the Censys API key is not configured."""

    def __init__(
        self, message="Censys API key is missing. Please set it in the env file."
    ):
        super().__init__(message)


class InvalidLogLevelError(CensysTenableException):
    """Exception raised when the log level is not set to one of
    [ CRITICAL, ERROR, WARNING, INFO, DEBUG ]."""

    def __init__(
        self,
        message="Invalid log level. Please set it to one of "
        "[ CRITICAL, ERROR, WARNING, INFO, DEBUG ] in the env file.",
    ):
        super().__init__(message)


class RunIntervalTooSmallError(CensysTenableException):
    """Exception raised when the run interval is set to a value less than 120 and greater than -1."""

    def __init__(
        self,
        message="Run interval must be set to a value greater than 120 or equal to -1.",
    ):
        super().__init__(message)


class MissingRunIntervalError(CensysTenableException):
    """Exception raised when the run interval is not configured."""

    def __init__(self, message="Invalid run interval. Please set to an integer"):
        super().__init__(message)


# Tenable exceptions
class MissingTenableAccessKeyError(CensysTenableException):
    """Exception raised when no Tenable access key is configured."""

    def __init__(
        self,
        message="Missing Tenable access key. Please set it in config.yml.",
    ):
        super().__init__(message)


class MissingTenableSecretKeyError(CensysTenableException):
    """Exception raised when the Tenable secret key is not configured."""

    def __init__(
        self,
        message="Missing Tenable secret key. Please set it in config.yml.",
    ):
        super().__init__(message)


class MissingTenableHostSourceError(CensysTenableException):
    """Exception raised when the Tenable host source is not configured."""

    def __init__(
        self,
        message="Missing Tenable host source. Please set it in config.yml.",
    ):
        super().__init__(message)
