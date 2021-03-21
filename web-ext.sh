#!/bin/bash -e

web-ext build -s "./src" --overwrite-dest

echo -n "Enter your JWT issuer key from addons.mozilla.org: "
read API_KEY

echo -n "Enter your JWT secret from addons.mozilla.org: "
read -s API_SECRET
echo

# echo -n "Enter the extension ID: "
# read ADDON_ID
# echo

web-ext sign -s "./src" --api-key "${API_KEY}" --api-secret "${API_SECRET}" # --id "${ADDON_ID}"
