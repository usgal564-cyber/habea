#!/bin/bash
while true; do
  bun run dev >> /tmp/next-server.log 2>&1
  sleep 1
done
