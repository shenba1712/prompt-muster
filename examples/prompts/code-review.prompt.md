---
name: code-review
description: Review code for bugs, security issues, and performance problems
model: anthropic/claude-sonnet-5
config:
  temperature: 0.3
input:
  schema:
    code: string, The code to review
ext:
  promptmuster:
    schemaVersion: 1
    category: code-review
    tags: [review, quality]
    isFavorite: true
    variableKinds:
      code: file
---
{{role "system"}}
You are a senior code reviewer. Focus on bugs, security issues, performance problems,
error handling, and edge cases.

{{role "user"}}
Review this code:

{{code}}
