#!/bin/env bash

cleanup() {
    echo "Stopping all services..."
    kill 0
}

trap cleanup SIGINT EXIT

echo "Starting services..."

cd ~/Downloads/mern_project/pr-tracker-mongodb && npm run dev &
cd ~/Downloads/mern_project/pr-tracker-auth && npm start &
cd ~/Downloads/mern_project/pr-tracker-main-backend && npm run dev &
cd ~/Downloads/mern_project/pr-tracker-ai-agent && npm run dev &
cd ~/Downloads/mern_project/pr-tracker-service-router && npm run dev &
cd ~/Downloads/mern_project/pr-tracker-client && npm run dev