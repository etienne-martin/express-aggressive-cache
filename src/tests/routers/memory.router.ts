import { Router } from "express";
import { expressAggressiveCache } from "../../";

export const memoryRouter = Router();

memoryRouter.use(expressAggressiveCache());

memoryRouter.all("/text", (req, res) => {
  res.send("hello world");
});

memoryRouter.get("/json", (req, res) => {
  res.json({
    hello: "world"
  });
});

memoryRouter.get("/buffer", (req, res) => {
  res.end(Buffer.from("hello world"));
});

memoryRouter.get("/empty", (req, res) => {
  res.end("");
});

memoryRouter.get("/empty-2", (req, res) => {
  res.write("");
  res.end();
});

memoryRouter.get("/multiple-chunks", (req, res) => {
  res.write("chunk1");
  res.write("chunk2");
  res.write("chunk3");
  res.end();
});

memoryRouter.get("/multiple-chunks-2", (req, res) => {
  res.write("chunk1");
  res.write("chunk2");
  res.end("chunk3");
});

memoryRouter.get("/no-cache", (req, res) => {
  res.setHeader("cache-control", "no-cache");
  res.send("hello world");
});

memoryRouter.get("/no-store", (req, res) => {
  res.setHeader("cache-control", "no-store");
  res.send("hello world");
});

memoryRouter.get("/private", (req, res) => {
  res.setHeader("cache-control", "private");
  res.send("hello world");
});

memoryRouter.get("/max-age-0", (req, res) => {
  res.setHeader("cache-control", "max-age=0");
  res.send("hello world");
});

memoryRouter.get("/max-age-nan", (req, res) => {
  res.setHeader("cache-control", "max-age=NaN");
  res.send("hello world");
});

memoryRouter.get("/invalid-cache-control", (req, res) => {
  res.setHeader("cache-control", "A*W&D?&*dty78=auwdtatd7*ADT?");
  res.send("hello world");
});
