#!/bin/sh
set -e

echo "Running frontend quality gates..."
cd frontend
npm run gates
echo "All quality gates passed!"
