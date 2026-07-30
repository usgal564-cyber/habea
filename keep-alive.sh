#!/bin/bash
cd /home/z/my-project/frontend
while true; do
  ./node_modules/.bin/next dev -p 3000 2>&1 | tee -a /home/z/my-project/dev.log
  echo "RESTARTING..." >> /home/z/my-project/dev.log
  sleep 2
done
