const ElevatedCommandExecutor = require("../ElevatedCommandExecutor");

test("Command executes with env var set", async done => {
  const elevatedCommandExecutor = new ElevatedCommandExecutor({
    HELLO_VAR: "hello"
  });

  const cmd =
    process.platform === "win32" ? "echo %HELLO_VAR%" : "echo $HELLO_VAR";
  const expected = process.platform === "win32" ? "hello\r\n" : "hello\n";

  const result = await elevatedCommandExecutor.execute(cmd);
  expect(result.stdout).toBe(expected);
  done();
});
