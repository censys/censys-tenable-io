# censys-tenable-io

Ingest Censys data into a Tenable.io instance.


## Overview

censys-tenable-io is a docker container that pulls data from the Censys Enterprise Platform, parses IP addresses, and pushes the data to a Tenable.io cloud instance.


## Dependencies

Docker


## Setup Summary

Step 1: Log into your tenable.io instance and generate an API key in the API keys section of your account

Step 2: Copy settings_example.yaml to settings.yaml and modify settings.yaml:

 - A Censys API key is needed and can be found here: https://app.censys.io/admin
 - Enter your Tenable.io API key

Step 3: Build a container for the Censys Tenable.io Integration:

 - ./censys-tenable-io.sh build

 To store persisent files, it creates (if necessary) and mounts this directory on the container host: "$HOME/censys-storage/tenable-io"

 Step 4: Run the container:

 - ./censys-tenable-io.sh run


## Setup Details

