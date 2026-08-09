---
name: debug-error
description: Help debug an error, explain the root cause, and suggest a fix
model: openai/gpt-5.6-luna
config:
  temperature: 0.4
input:
  schema:
    error: string, The error message or stack trace to debug
ext:
  promptmuster:
    schemaVersion: 1
    category: debugging
    tags: [debug]
    isFavorite: false
    variableKinds:
      error: textarea
---
{{role "system"}}
You are a debugging assistant. Explain the root cause and suggest a fix with code examples.

{{role "user"}}
Help me debug this error:

{{error}}
