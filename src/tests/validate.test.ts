import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";

function mockReqRes(body: unknown) {
  const req = { body } as Request;
  const res = {
    status: function (code: number) {
      this._status = code;
      return this;
    },
    json: function (data: unknown) {
      this._data = data;
      return this;
    },
    _status: 200,
    _data: null,
  } as unknown as Response & { _status: number; _data: unknown };
  const next: NextFunction = () => {
    (next as unknown as { called: boolean }).called = true;
  };
  (next as unknown as { called: boolean }).called = false;
  return { req, res, next };
}

describe("validate middleware", () => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18),
  });

  it("passes valid data", () => {
    const { req, res, next } = mockReqRes({
      name: "John",
      email: "john@example.com",
      age: 25,
    });
    validate(schema)(req, res, next);
    expect((next as unknown as { called: boolean }).called).toBe(true);
  });

  it("rejects invalid data", () => {
    const { req, res, next } = mockReqRes({
      name: "J",
      email: "invalid",
      age: 15,
    });
    validate(schema)(req, res, next);
    expect((next as unknown as { called: boolean }).called).toBe(false);
    expect(res._status).toBe(400);
    expect(res._data).toHaveProperty("errors");
  });

  it("rejects missing fields", () => {
    const { req, res, next } = mockReqRes({});
    validate(schema)(req, res, next);
    expect((next as unknown as { called: boolean }).called).toBe(false);
    expect(res._status).toBe(400);
  });
});
