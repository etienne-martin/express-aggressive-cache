import express, { Router } from "express";
import path from "path";
import nanoid from "nanoid";

export const sharedRoutes = Router();

sharedRoutes.all("/text", (req, res) => {
  res.send("hello world");
});

sharedRoutes.get("/json", (req, res) => {
  res.json({
    hello: "world"
  });
});

sharedRoutes.get("/buffer", (req, res) => {
  res.end(Buffer.from("hello world"));
});

sharedRoutes.get("/empty", (req, res) => {
  res.end("");
});

sharedRoutes.get("/empty-2", (req, res) => {
  res.write("");
  res.end();
});

sharedRoutes.get("/multiple-chunks", (req, res) => {
  res.write("chunk1");
  res.write("chunk2");
  res.end();
});

sharedRoutes.get("/multiple-chunks-2", (req, res) => {
  res.write("chunk1");
  res.end("chunk2");
});

sharedRoutes.get("/custom-header", (req, res) => {
  res.setHeader("custom-header", "hello");
  res.end("");
});

sharedRoutes.get("/forbidden", (req, res) => {
  res.status(403).end("");
});

sharedRoutes.get("/no-cache", (req, res) => {
  res.setHeader("cache-control", "no-cache");
  res.send("hello world");
});

sharedRoutes.get("/no-store", (req, res) => {
  res.setHeader("cache-control", "no-store");
  res.send("hello world");
});

sharedRoutes.get("/private", (req, res) => {
  res.setHeader("cache-control", "private");
  res.send("hello world");
});

sharedRoutes.get("/max-age-0", (req, res) => {
  res.setHeader("cache-control", "max-age=0");
  res.send("hello world");
});

sharedRoutes.get("/max-age-nan", (req, res) => {
  res.setHeader("cache-control", "max-age=NaN");
  res.send("hello world");
});

sharedRoutes.get("/invalid-cache-control", (req, res) => {
  res.setHeader("cache-control", "A*W&D?&*dty78=auwdtatd7*ADT?");
  res.send("hello world");
});

sharedRoutes.use(
  express.static(path.join(__dirname, "static"), {
    maxAge: 10000
  })
);

sharedRoutes.get("/set-cookie", (req, res) => {
  res.cookie("my-cookie", nanoid());
  res.send("hello world");
});

sharedRoutes.get("/upstream-cookie-and-set-cookie", (req, res) => {
  res.cookie("my-cookie", nanoid());
  res.send("hello world");
});

sharedRoutes.get("*", (req, res) => {
  res.send("hello world");
});
