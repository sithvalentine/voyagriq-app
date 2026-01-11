#!/bin/bash
# Quick cleanup script with auto-confirmation

cd /Users/james/claude/voyagriq-app

echo "yes" | echo "DELETE PRODUCTION TEST ACCOUNTS" | node scripts/clean-production-test-accounts.js
