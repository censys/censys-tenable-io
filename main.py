import logging
import sched
import time

from censys_asm.config_manager import ConfigManager
from censys_asm.tenable import CensysTenable


def main():
    """Main Censys Tenable driver"""

    # Get configurations
    configs = ConfigManager()
    scheduler = sched.scheduler(time.time, time.sleep)
    censys_tenable = CensysTenable(configs)

    # Set up logging
    logging.basicConfig(level=getattr(logging, configs.logging_level))
    logger = logging.getLogger("censys_tenable_asm")

    censys_tenable.run()

    while configs.interval > 0:
        scheduler.enter((configs.interval * 60), 1, censys_tenable.run)

        logger.info(
            f"Finished updating Tenable hosts. Sleeping for {configs.interval} minutes."
        )

        scheduler.run()


if __name__ == "__main__":
    main()
