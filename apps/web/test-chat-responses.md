# Chat Response Testing

## Test the structured response system with these questions:

### 1. Steps Response (Emergency Tax)
Try: "What happens if my employer already deducted emergency tax?"
Expected: Numbered steps with callout showing tax refund calculation

### 2. Checklist Response (Bank Account)
Try: "What documents do I need to open a bank account?"
Expected: Required/optional document lists with sources

### 3. Alert Response (Deadline)
Try: "Is there any urgent deadline I should know about?"
Expected: Warning alert with action and deadline

### 4. Plain Text Response (Default)
Try: "Tell me about New Zealand"
Expected: Simple text response with header

## Testing Steps:
1. Open http://localhost:3003
2. Navigate to roadmap page (to access chat)
3. Click chat FAB
4. Try each question above
5. Verify visual hierarchy matches mockup expectations
6. Test source links click to open external pages
7. Test scrolling behavior
8. Verify thinking animation and progressive disclosure