import test from "node:test";
import assert from "node:assert/strict";
import { runDirectoryPicker } from "../server/directory-picker.mjs";

test("directory picker fails closed on unsupported platforms", async () => {
  await assert.rejects(
    runDirectoryPicker({ platform: "linux" }),
    /NATIVE_DIRECTORY_PICKER_UNSUPPORTED/,
  );
});
