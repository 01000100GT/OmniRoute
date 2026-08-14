import test from "node:test";
import assert from "node:assert/strict";

const { openaiToClaudeRequest } =
  await import("../../open-sse/translator/request/openai-to-claude.ts");

function assistantToolUseInput(input: unknown): unknown {
  const result = openaiToClaudeRequest(
    "MiniMax-M3",
    {
      messages: [
        { role: "user", content: "Use the tool." },
        {
          role: "assistant",
          content: [{ type: "tool_use", id: "call_1", name: "read_file", input }],
        },
        { role: "user", content: "Continue." },
      ],
    },
    false
  );
  const assistant = result.messages.find((message) => message.role === "assistant");
  const toolUse = assistant?.content.find((block) => block.type === "tool_use");
  return toolUse?.input;
}

test("Claude translator parses JSON-encoded historical tool_use input", () => {
  assert.deepEqual(assistantToolUseInput('{"path":"README.md"}'), { path: "README.md" });
});

test("Claude translator replaces invalid historical tool_use input with an object", () => {
  for (const input of ["{", null, ["not", "an", "object"], 42]) {
    assert.deepEqual(assistantToolUseInput(input), {});
  }
});

test("Claude translator preserves object historical tool_use input", () => {
  assert.deepEqual(assistantToolUseInput({ path: "README.md" }), { path: "README.md" });
});

test("Claude translator normalizes malformed Chat tool-call arguments to an object", () => {
  const result = openaiToClaudeRequest(
    "MiniMax-M3",
    {
      messages: [
        { role: "user", content: "Use the tool." },
        {
          role: "assistant",
          tool_calls: [
            {
              id: "call_1",
              type: "function",
              function: { name: "read_file", arguments: "[" },
            },
          ],
        },
        { role: "user", content: "Continue." },
      ],
    },
    false
  );
  const assistant = result.messages.find((message) => message.role === "assistant");
  const toolUse = assistant?.content.find((block) => block.type === "tool_use");
  assert.deepEqual(toolUse?.input, {});
});
