#!/bin/bash
cd /home/z/my-project/frontend
while true; do
  echo "=== $(date) Starting frontend ===" >> /home/z/my-project/dev.log
  ./node_modules/.bin/vite --host >> /home/z/my-project/dev.log 2>&1
  echo "=== $(date) Frontend exited, restarting ===" >> /home/z/my-project/dev.log
  sleep 2
done
