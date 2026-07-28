#!/bin/bash
while true; do
  ./node_modules/.bin/next dev -p 3000 2>&1 | tee dev.log
  echo "RESTARTING..." >> dev.log
  sleep 2
done
