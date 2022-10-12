#!/bin/bash
set -euo pipefail
# save workdir root as envvar
export WORKDIR=$PWD

# install (dev) dependencies for backend
cd $WORKDIR/backend
npm install