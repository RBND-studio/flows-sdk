#!/bin/bash

# Run this script to start docker container and run all playwright tests

docker run --rm --ipc=host \
  --mount type=bind,src=./../../,dst=/app \
  --mount type=volume,dst=/app/node_modules \
  --mount type=volume,dst=/app/.pnpm-store \
  mcr.microsoft.com/playwright:v1.49.1-noble \
  $1