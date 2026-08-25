---
name: generate-api-docs
description: Write API documentation for an endpoint, including request/response examples and error codes
model: googleai/gemini-2.5-pro
config:
  temperature: 0.2
input:
  schema:
    endpoint: string, The endpoint's route, method, and handler code to document
output:
  schema:
    summary: string, One-sentence description of what the endpoint does
    parameters(array, Name and description of each request parameter): string
    responses(array, Example response shapes, one per relevant status code): string
    errorCodes(array, Error codes this endpoint can return and what each means): string
ext:
  promptmuster:
    schemaVersion: 1
    category: documentation
    tags: [docs, api]
    isFavorite: false
    variableKinds:
      endpoint: file
---
{{role "system"}}
You are a technical writer producing API reference documentation. Include request/response
examples and error codes.

{{role "user"}}
Write API documentation for this endpoint:

{{endpoint}}
