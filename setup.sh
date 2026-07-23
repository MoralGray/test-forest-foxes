#!/usr/bin/env bash
set -e

export FOREST_FOXES_DATABASE_URL="file:$(pwd)/.db/forest-foxes/dev.db"

echo "---------------------------------------------------------------------------"
echo "Installing NPM dependencies..."
npm install
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Generating Prisma client..."
mise run forest-foxes:db-generate
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Creating database directory..."
mkdir -p .db/forest-foxes
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Pushing Prisma schema to database..."
(
    cd packages/forest-foxes-shared-prisma \
    && FOREST_FOXES_DATABASE_URL="file:$(pwd)/../../.db/forest-foxes/dev.db" \
        npm run db:push
)
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Starting backend for seeding..."
npx nx run forest-foxes-backend:start > /dev/null 2>&1 &
BACKEND_PID=$!

for i in $(seq 1 30); do
  if curl -s http://localhost:8020/api/health > /dev/null 2>&1; then
    echo "Backend is ready."
    break
  fi
  sleep 1
done

if ! curl -s http://localhost:8020/api/health > /dev/null 2>&1; then
  echo "Backend failed to start. Aborting."
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Seeding working data..."
mise run forest-foxes:seed-working
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Stopping backend..."
kill $BACKEND_PID 2>/dev/null
wait $BACKEND_PID 2>/dev/null
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Setup complete!"
echo "Run: mise run all"
echo "---------------------------------------------------------------------------"
