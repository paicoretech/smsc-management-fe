#!/bin/sh
set -e

APP_DIR=/var/www/app

############################################
# 1) Backend URL validation (no normalization)
############################################
DEFAULT_BACKEND="http://127.0.0.1:8080"
RAW_BACKEND="$BACKEND_IP"

if [ -z "$RAW_BACKEND" ]; then
  echo "ERROR: BACKEND_IP environment variable is required"
  exit 1
fi

# Expect BACKEND_IP to be a full URL including protocol
FINAL_BACKEND="$RAW_BACKEND"

echo "Backend resolved to: $FINAL_BACKEND"

############################################
# 2) Replace backend URL in JS
############################################
echo "Replacing default backend $DEFAULT_BACKEND with $FINAL_BACKEND ..."

find "$APP_DIR" -type f -name '*.js' \
  -exec sed -i "s|$DEFAULT_BACKEND|$FINAL_BACKEND|g" {} +

############################################
# 3) Replace NG_APP_* placeholders
############################################
echo "Replacing NG_APP_* placeholders ..."

env | grep '^NG_APP_' | while IFS='=' read -r VAR_NAME VAR_VALUE; do
  PLACEHOLDER="___${VAR_NAME}___"

  ESCAPED_VALUE=$(printf '%s\n' "$VAR_VALUE" \
    | sed -e 's/[\/&]/\\&/g' -e 's/\\/\\\\/g')

  echo "  - $PLACEHOLDER → $VAR_NAME"

  find "$APP_DIR" -type f -name '*.js' \
    -exec sed -i "s|$PLACEHOLDER|$ESCAPED_VALUE|g" {} +
done

echo "Runtime configuration completed successfully."
