#!/bin/bash
cd /home/z/my-project
while true; do
  echo "=== $(date) Starting Vite ===" >> /home/z/my-project/dev.log
  npx vite --host >> /home/z/my-project/dev.log 2>&1
  echo "=== $(date) Exited, restarting in 2s ===" >> /home/z/my-project/dev.log
  sleep 2
done
