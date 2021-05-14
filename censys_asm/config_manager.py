import logging

import yaml

from censys_asm import exceptions

"""List of valid logging levels."""
VALID_LOG_LEVELS = ["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"]


class ConfigManager:
    """Manager for Censys Tenable configurations"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._get_configs()
        self._validate_configs()

    def _get_configs(self) -> None:
        """Fetches all configurations from config.yml"""

        with open("config.yml") as fp:
            settings = yaml.safe_load(fp.read())

        # Censys configurations
        self.censys_api_key = settings["censys"]["asm_api_key"]
        self.logging_level = settings["censys"]["options"]["log_level"]
        self.interval = int(settings["censys"]["options"]["interval"])

        # Tenable configurations
        self.tenable_access_key = settings["tenable"]["tenable_access_key"]
        self.tenable_secret_key = settings["tenable"]["tenable_secret_key"]
        self.host_source = settings["tenable"]["host_source"]

    def _validate_configs(self) -> None:
        """Validates all configurations from config.yml"""

        # Validate Censys API key
        if not self.censys_api_key:
            raise exceptions.MissingCensysAPIKeyError()

        # Validate logging level
        if self.logging_level not in VALID_LOG_LEVELS:
            raise exceptions.InvalidLogLevelError()

        # Validate run interval
        if not self.interval:
            raise exceptions.MissingRunIntervalError()

        if 120 > self.interval > 0:
            self.logger.warning("Interval is less than 120 minutes")
            raise exceptions.RunIntervalTooSmallError()

        # Validate Tenable settings
        if not self.tenable_access_key:
            raise exceptions.MissingTenableAccessKeyError()

        if not self.tenable_secret_key:
            raise exceptions.MissingTenableSecretKeyError()

        if not self.host_source:
            raise exceptions.MissingTenableHostSourceError()
