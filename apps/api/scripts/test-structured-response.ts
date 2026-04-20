// Test script to verify post-processing structured responses work

const API_BASE = 'http://localhost:3001';

// Mock user data for testing
const mockUserId = 'test-user-structured';
const mockToken = 'fake-token-for-testing';

async function testStructuredResponse() {
  console.log('🔍 Testing structured response post-processing...\n');

  try {
    // Step 1: Create chat session
    console.log('1. Creating chat session...');
    const sessionResponse = await fetch(`${API_BASE}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
      body: JSON.stringify({
        entryPoint: 'ROADMAP'
      }),
    });

    if (!sessionResponse.ok) {
      console.log(`❌ Session creation failed: ${sessionResponse.status}`);
      return;
    }

    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.sessionId;
    console.log(`✅ Session created: ${sessionId}\n`);

    // Step 2: Send message and capture SSE stream
    console.log('2. Sending message and capturing SSE stream...');
    const messageResponse = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
      body: JSON.stringify({
        content: 'How do I get a NZ mobile number in Wellington?'
      }),
    });

    if (!messageResponse.ok || !messageResponse.body) {
      console.log(`❌ Message failed: ${messageResponse.status}`);
      return;
    }

    // Step 3: Parse SSE stream
    const reader = messageResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let chunkCount = 0;
    let hasStructuredEvent = false;
    let hasDoneEvent = false;
    let structuredContent = '';

    console.log('📡 SSE Events:');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        try {
          const event = JSON.parse(line.slice(6));

          if (event.type === 'chunk') {
            chunkCount++;
            if (chunkCount <= 3) {
              console.log(`   chunk: "${event.text.substring(0, 50)}..."`);
            } else if (chunkCount === 4) {
              console.log('   ... (more chunks)');
            }
          } else if (event.type === 'structured') {
            hasStructuredEvent = true;
            structuredContent = event.content;
            console.log(`   ✨ structured: ${event.content.substring(0, 100)}...`);
          } else if (event.type === 'done') {
            hasDoneEvent = true;
            console.log('   ✅ done\n');
            break;
          } else if (event.type === 'error') {
            console.log(`   ❌ error: ${event.message}`);
            return;
          }
        } catch (e) {
          // Skip malformed lines
        }
      }
    }

    // Step 4: Verify results
    console.log('📊 Results:');
    console.log(`   Chunks received: ${chunkCount}`);
    console.log(`   Structured event: ${hasStructuredEvent ? '✅ YES' : '❌ NO'}`);
    console.log(`   Done event: ${hasDoneEvent ? '✅ YES' : '❌ NO'}`);

    if (hasStructuredEvent) {
      try {
        const parsed = JSON.parse(structuredContent);
        console.log(`   Structured type: ${parsed.type}`);
        console.log(`   Has sources: ${parsed.sources ? '✅ YES' : '❌ NO'}`);
        console.log(`\n🎉 POST-PROCESSING WORKS!`);
      } catch (e) {
        console.log(`   ⚠️ Structured content is not valid JSON`);
      }
    } else {
      console.log(`\n❌ POST-PROCESSING FAILED - No structured event received`);
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Run the test
testStructuredResponse().catch(console.error);