import express from "express";
import { expressAggressiveCache } from "../";

export const app = express();

app.use(expressAggressiveCache());

app.get("/text", (req, res) => {
  res.send("hello world");
});

app.get("/json", (req, res) => {
  res.json({
    hello: "world"
  });
});

app.get("/buffer", (req, res) => {
  res.end(Buffer.from("hello world"));
});

app.get("/empty", (req, res) => {
  res.end("");
});

app.get("/empty-2", (req, res) => {
  res.write("");
  res.end();
});

app.get("/multiple-chunks", (req, res) => {
  res.write("chunk1");
  res.write("chunk2");
  res.write("chunk3");
  res.end();
});

app.get("/multiple-chunks-2", (req, res) => {
  res.write("chunk1");
  res.write("chunk2");
  res.end("chunk3");
});

app.get("/no-cache", (req, res) => {
  res.setHeader("cache-control", "no-cache");
  res.send("hello world");
});

app.get("/no-store", (req, res) => {
  res.setHeader("cache-control", "no-store");
  res.send("hello world");
});

app.get("/private", (req, res) => {
  res.setHeader("cache-control", "private");
  res.send("hello world");
});

app.get("/max-age-0", (req, res) => {
  res.setHeader("cache-control", "max-age=0");
  res.send("hello world");
});

app.get("/max-age-nan", (req, res) => {
  res.setHeader("cache-control", "max-age=NaN");
  res.send("hello world");
});

app.get("/invalid-cache-control", (req, res) => {
  res.setHeader("cache-control", "A*W&D?&*dty78=auwdtatd7*ADT?");
  res.send("hello world");
});
