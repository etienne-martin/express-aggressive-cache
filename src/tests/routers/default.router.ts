import { Router } from "express";
import { expressAggressiveCache } from "../../";

export const defaultRouter = Router();

defaultRouter.use(expressAggressiveCache());

defaultRouter.all("/text", (req, res) => {
  res.send("hello world");
});

defaultRouter.get("/json", (req, res) => {
  res.json({
    hello: "world"
  });
});

defaultRouter.get("/buffer", (req, res) => {
  res.end(Buffer.from("hello world"));
});

defaultRouter.get("/empty", (req, res) => {
  res.end("");
});

defaultRouter.get("/empty-2", (req, res) => {
  res.write("");
  res.end();
});

defaultRouter.get("/multiple-chunks", (req, res) => {
  res.write("chunk1");
  res.write("chunk2");
  res.write("chunk3");
  res.end();
});

defaultRouter.get("/multiple-chunks-2", (req, res) => {
  res.write("chunk1");
  res.write("chunk2");
  res.end("chunk3");
});

defaultRouter.get("/custom-header", (req, res) => {
  res.setHeader("custom-header", "hello");
  res.end("");
});

defaultRouter.get("/forbidden", (req, res) => {
  res.status(403).end("");
});

defaultRouter.get("/no-cache", (req, res) => {
  res.setHeader("cache-control", "no-cache");
  res.send("hello world");
});

defaultRouter.get("/no-store", (req, res) => {
  res.setHeader("cache-control", "no-store");
  res.send("hello world");
});

defaultRouter.get("/private", (req, res) => {
  res.setHeader("cache-control", "private");
  res.send("hello world");
});

defaultRouter.get("/max-age-0", (req, res) => {
  res.setHeader("cache-control", "max-age=0");
  res.send("hello world");
});

defaultRouter.get("/max-age-nan", (req, res) => {
  res.setHeader("cache-control", "max-age=NaN");
  res.send("hello world");
});

defaultRouter.get("/invalid-cache-control", (req, res) => {
  res.setHeader("cache-control", "A*W&D?&*dty78=auwdtatd7*ADT?");
  res.send("hello world");
});
