#!/bin/bash
set -euo pipefail
# save workdir root as envvar
export WORKDIR=$PWD

# install (dev) dependencies for backend
cd $WORKDIR/tfl_poller_service
npm install