#!/bin/sh
TOKEN_CONTENT='{"user":"root","auths":{"root":{"path":["root"],"roles":["admin"]}}}'
AUTH_TOKEN=$(echo "$TOKEN_CONTENT" | base64 -w 0)
echo "$AUTH_TOKEN"