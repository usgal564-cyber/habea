#!/bin/bash
export PATH=$HOME/go-sdk/go/bin:$PATH
cd /home/z/my-project/backend
while true; do
  echo "=== $(date) Starting backend ===" >> /home/z/my-project/backend.log
  ./habea-backend >> /home/z/my-project/backend.log 2>&1
  echo "=== $(date) Backend exited, restarting ===" >> /home/z/my-project/backend.log
  sleep 2
done
