import logging

from censys.asm.client import AsmClient
from censys_asm.config_manager import ConfigManager
from tenable.io import TenableIO


class CensysTenable:
    """Censys Tenable Integration Client"""

    def __init__(self, configs: ConfigManager):
        self.tenable_base_url = "https://cloud.tenable.com"
        self.logger = logging.getLogger(__name__)
        self.configs = configs

        self.asm_client = AsmClient(configs.censys_api_key)
        self.tenable_client = TenableIO(
            configs.tenable_access_key, configs.tenable_secret_key
        )

        self.tenable_hosts = {}
        self.censys_seeds = {}
        self.censys_hosts = {}

    def run(self) -> None:
        """Executes the importing and deleting of Tenable.io hosts"""

        # Just grab IPV4 for now
        self.tenable_hosts = {
            host["ipv4"][0]: host for host in self.tenable_client.assets.list()
        }
        self.censys_seeds = {
            seed["value"]: seed
            for seed in self.asm_client.seeds.get_seeds()
            if seed["type"] == "IP_ADDRESS"
        }

        # Get a list of all hosts that are not CDNs or shared web hosts
        for host in self.asm_client.hosts.get_assets(page_size=1000):
            if (
                host["data"]["cdn"]
                or "shared_webhost" in host["data"]["classifications"]
            ):
                self.logger.info(f"Skipping CDN/shared web host {host['assetId']}")
                continue

            self.censys_hosts[host["assetId"]] = host

        self.add_assets_to_tenable(self.censys_seeds)
        self.add_assets_to_tenable(self.censys_hosts)
        self.remove_deleted_censys_hosts_from_tenable()

    def add_assets_to_tenable(self, censys_assets: dict) -> None:
        """
        Adds Censys ASM hosts to Tenable.io and tags them as 'in-tenable' within ASM

        Args:
            censys_assets (dict): A dict of censys seed/host assets.
        """

        for ip in censys_assets:
            if ip not in self.tenable_hosts:
                self.tenable_client.assets.asset_import(
                    self.configs.host_source, {"ipv4": [ip]}
                )
                self.logger.info(f"Imported ipv4 host {ip}")

                if ip in self.censys_hosts:
                    self.asm_client.hosts.add_tag(ip, "in-tenable")
                    self.logger.info(f"Tagged ipv4 host {ip} in ASM as 'in-tenable'")
            else:
                # Censys and Tenable match so this host doesn't need to be evaluated in the Tenable loop
                del self.tenable_hosts[ip]

    def remove_deleted_censys_hosts_from_tenable(self) -> None:
        """Removes deleted Censys ASM hosts from Tenable.io"""

        for ip, host in self.tenable_hosts.items():
            # If host was added by Censys and is no longer in ASM, delete it
            if (
                host["sources"][0]["name"] == self.configs.host_source
                and ip not in self.censys_seeds
                and ip not in self.censys_hosts
            ):
                self.tenable_client.assets.delete(host["id"])
                self.logger.info(f"Deleted ipv4 host {ip}")
