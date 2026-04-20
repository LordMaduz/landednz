#!/bin/bash

echo "🔍 Testing structured response post-processing..."
echo

# Create a test user first via the database
echo "1. Setting up test user in database..."
cd /Users/ruchira/Development/landednz/apps/api

# Create test user SQL
npx prisma db execute --url="postgresql://landednz:password@localhost:5432/landednz_dev" --sql="
INSERT INTO \"User\" (id, email, name, \"createdAt\", \"updatedAt\")
VALUES ('test-structured-user', 'test@test.com', 'Test User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO \"UserProfile\" (\"userId\", \"visaType\", \"familySituation\", city, occupation, \"arrivalDate\", \"personaKey\", \"createdAt\", \"updatedAt\")
VALUES ('test-structured-user', 'AEWV', 'DUAL_INCOME_COUPLE', 'WELLINGTON', 'Software Engineer', NOW() - INTERVAL '30 days', 'dual_aewv', NOW(), NOW())
ON CONFLICT (\"userId\") DO NOTHING;

INSERT INTO \"Subscription\" (\"userId\", \"isActive\", \"createdAt\", \"updatedAt\")
VALUES ('test-structured-user', true, NOW(), NOW())
ON CONFLICT (\"userId\") DO NOTHING;
"

echo "✅ Test user created"
echo

# Generate a JWT token for this user (simplified)
echo "2. Creating chat session..."

RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3001/chat/sessions \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: test-structured-user" \
  -d '{"entryPoint": "ROADMAP"}')

HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "201" ]; then
    echo "❌ Session creation failed: HTTP $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

SESSION_ID=$(echo $BODY | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)
echo "✅ Session created: $SESSION_ID"
echo

echo "3. Sending message and capturing SSE stream..."

# Send message and capture SSE events
curl -N -H "Content-Type: application/json" \
     -H "X-Test-User-Id: test-structured-user" \
     -X POST \
     -d '{"content": "How do I get a NZ mobile number?"}' \
     "http://localhost:3001/chat/sessions/$SESSION_ID/messages" | \
while IFS= read -r line; do
    if [[ $line == data:* ]]; then
        # Extract the JSON part
        json_part="${line#data: }"

        # Parse event type
        if echo "$json_part" | grep -q '"type":"chunk"'; then
            chunk_count=$((chunk_count + 1))
            if [ ${chunk_count:-0} -le 3 ]; then
                text=$(echo "$json_part" | grep -o '"text":"[^"]*' | cut -d'"' -f4 | head -c 30)
                echo "   chunk: \"$text...\""
            elif [ ${chunk_count:-0} -eq 4 ]; then
                echo "   ... (more chunks)"
            fi
        elif echo "$json_part" | grep -q '"type":"structured"'; then
            echo "   ✨ structured event received!"
            echo "   Content: $(echo "$json_part" | grep -o '"content":"[^"]*' | cut -d'"' -f4 | head -c 80)..."
            has_structured=true
        elif echo "$json_part" | grep -q '"type":"done"'; then
            echo "   ✅ done"
            break
        elif echo "$json_part" | grep -q '"type":"error"'; then
            error_msg=$(echo "$json_part" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
            echo "   ❌ error: $error_msg"
            break
        fi
    fi
done

echo
if [ "${has_structured:-false}" = true ]; then
    echo "🎉 POST-PROCESSING WORKS! Structured event was received."
else
    echo "❌ POST-PROCESSING FAILED - No structured event received."
fi