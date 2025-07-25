import { simnet, Tx, Chain, Account, types } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeEach } from "vitest";
import { sha256 } from "@stacks/transactions";
import { Buffer } from "node:buffer";

const contractName = "public-crisis-ledger";

describe("public-crisis-ledger contract", () => {
  let chain: Chain;
  let deployer: Account;
  let wallet1: Account;

  beforeEach(() => {
    chain = simnet.getChain();
    deployer = simnet.getAccounts().get("deployer")!;
    wallet1 = simnet.getAccounts().get("wallet_1")!;
  });

  const registerMessage = (sender: Account, message: string) => {
    const messageHash = sha256(Buffer.from(message));
    return Tx.contractCall(
      contractName,
      "register-message",
      [types.buff(messageHash)],
      sender.address
    );
  };

  it("allows the deployer to register a message hash", () => {
    const message = "This is an official announcement.";
    const tx = registerMessage(deployer, message);
    const block = chain.mineBlock([tx]);

    // The transaction should be successful (ok u1)
    expect(block.receipts[0].result).toBeOk(types.uint(1));

    // Verify the message is stored correctly
    const messageId = types.uint(1);
    const storedMessage = chain.callReadOnlyFn(
      contractName,
      "get-message",
      [messageId],
      deployer.address
    );

    const messageHash = sha256(Buffer.from(message));
    expect(storedMessage.result).toStrictEqual(
      types.some(
        types.tuple({
          announcer: types.principal(deployer.address),
          "block-height": types.uint(2), // Mined in block 2
          hash: types.buff(messageHash),
        })
      )
    );
  });

  it("prevents a non-deployer from registering a message hash", () => {
    const message = "This is a fake announcement.";
    const tx = registerMessage(wallet1, message);
    const block = chain.mineBlock([tx]);

    // The transaction should fail with err u401 (unauthorized)
    expect(block.receipts[0].result).toBeErr(types.uint(401));
  });

  it("increments the message ID for each new message", () => {
    chain.mineBlock([registerMessage(deployer, "First message")]);
    const block = chain.mineBlock([registerMessage(deployer, "Second message")]);
    expect(block.receipts[0].result).toBeOk(types.uint(2));
  });

  it("returns none for a message ID that does not exist", () => {
    const nonExistentId = types.uint(999);
    const result = chain.callReadOnlyFn(contractName, "get-message", [nonExistentId], deployer.address);
    expect(result.result).toBeNone();
  });
});