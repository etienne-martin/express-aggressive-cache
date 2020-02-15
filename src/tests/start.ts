import { app } from "./server";

app.listen(3000, () => {
  console.log(`Mode: [${process.env.NODE_ENV}]`);
  console.log(`Test server is listening on port ${3000}`);
});
