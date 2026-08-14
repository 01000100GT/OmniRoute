import assert from "node:assert/strict";
import test from "node:test";

import { DefaultExecutor } from "../../open-sse/executors/default.ts";

test("DefaultExecutor.applyJsonSchemaFallback downgrades DeepSeek json_schema response_format", () => {
  const executor = new DefaultExecutor("deepseek");
  const body = {
    model: "deepseek-v4-flash",
    messages: [{ role: "user", content: "give me JSON" }],
    response_format: {
      type: "json_schema",
      json_schema: { name: "answer", schema: { type: "object" } },
    },
  };

  const result = executor.applyJsonSchemaFallback(body);

  assert.deepEqual(result.response_format, { type: "json_object" });
  assert.match(result.messages[0].content, /strictly follows this JSON schema/);
  assert.deepEqual(body.response_format, {
    type: "json_schema",
    json_schema: { name: "answer", schema: { type: "object" } },
  });
});
