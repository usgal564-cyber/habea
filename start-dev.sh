#!/bin/bash
cd /home/z/my-project/frontend
while true; do
  echo "=== $(date) Starting dev server ===" >> /home/z/my-project/dev.log
  node ./node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  echo "=== $(date) Server exited, restarting in 3s ===" >> /home/z/my-project/dev.log
  sleep 3
done
