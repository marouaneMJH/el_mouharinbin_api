#!/bin/bash

# Title for the main GNOME Terminal window
WINDOW_TITLE="Development Services"

# Open GNOME Terminal with multiple tabs
gnome-terminal \
  --window -t "$WINDOW_TITLE" \
  --tab --title="API"       -- bash -c "npm run start:dev; exec bash" \
  --tab --title="Users"     -- bash -c "npm run start:users:dev; exec bash" \
  --tab --title="Auth"      -- bash -c "npm run start:auth:dev; exec bash" \
  --tab --title="Mail"      -- bash -c "npm run start:mail:dev; exec bash" \
  --tab --title="Chat"      -- bash -c "npm run start:chat:dev; exec bash" \
  --tab --title="Other"     -- bash -c "npm run start::dev; exec bash" \
  --tab --title="Docker"    -- bash -c "make up; exec bash"
