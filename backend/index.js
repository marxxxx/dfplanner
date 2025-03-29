// Updated Backend: server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { tidy } = require("htmltidy2");
const { formatDate } = require("./formatDate");
const { crawlEvents } = require("./crawl");
const { parseEvents } = require("./parseEvents");
const fs = require("fs");
const { error } = require("console");

const app = express();
app.use(cors());

const PORT = 3000;

app.get("/api/events", async (req, res) => {
  try {
    const tag = parseInt(req.query.day || "1", 10);
    const fileName = `data/day${tag}.json`;

    if (!fs.existsSync(fileName)) {
      const result = await crawlEvents(244 + tag, formatDate(new Date()));
      fs.writeFileSync(
        `data/day${tag}.json`,
        JSON.stringify(result, null, 2),
        "utf-8"
      );
    }

    const data = fs.readFileSync(fileName, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch events");
  }
});

app.get("/api/events/crawl", async (req, res) => {
  const date = formatDate(new Date());
  const startDay = parseInt(req.query.startDay || "1", 10);

  const results = [];

  for (let day = startDay; day <= 6; day++) {
    try {
      const result = await crawlEvents(day, date);

      fs.writeFileSync(
        `data/day${day}.json`,
        JSON.stringify(result, null, 2),
        "utf-8"
      );

      results.push({day: day, result: 'OK'})
    } catch (e) {
      console.log('Failed to crawl day', day, e);
      results.push({day: day, result: 'Failed', error: e.message})
    }
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
