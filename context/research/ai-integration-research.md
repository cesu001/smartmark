# AI Integration Research

## Output

docs/ai-integration-plan.md

## Research

Investigate best practices for integrating the OpenAI "gpt-5.4-nano" model into a Next.js application for the following features:

- RAG - Note search by content vector (Users prompt words and ai analyzes words' vector to match vector of note's content in database)
- AI Summaries for note content
- AI Chatbot

## Include

- OpenAI SDK setup and configuration
- Vercel ai SDK setup and configuration
- Server action patterns for AI calls
- Streaming vs non-streaming responses
- Error handling and rate limiting
- Pro user gating patterns
- Cost optimization strategies
- UI patterns for AI features (loading states, accept/reject suggestions)
- Security considerations (API key handling, input sanitization)
- Transforming note's content to vector when note saving (embedding and saving to postgre)
- Compare openai + next.js and vercel ai sdk + next.js

## Sources

- Web search for OpenAI + Next.js patterns
- Web search for Vercel ai SDK + Next.js patterns
- Context7 docs for OpenAI SDK
- Context7 docs for Vercel ai SDK
- Existing codebase patterns (server actions, Pro gating)
- @src/actions/\*.ts for action patterns
- @src/lib/usage-limits.ts for gating patterns
