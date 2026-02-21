#!/bin/bash

# Create topics in Redpanda
docker exec taskflow-redpanda rpk topic create task-events --partitions 3
docker exec taskflow-redpanda rpk topic create reminders --partitions 2
docker exec taskflow-redpanda rpk topic create task-updates --partitions 2

echo "✅ Topics created successfully"
docker exec taskflow-redpanda rpk topic list