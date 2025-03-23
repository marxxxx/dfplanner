// Updated Backend: server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

app.get('/api/events', async (req, res) => {
  const day = parseInt(req.query.day || '1', 10);
  const tag = 244 + day; // day 1 = 245, day 2 = 246, etc.
  const date = formatDate(new Date());

  const url = `https://www.donaufestival.at/de/programm?tag=${tag}&date=${date}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const events = [];

    $('.event-item').each((i, el) => {
      const linkPath = $(el).find('a.event-item__link').attr('href');
      const idMatch = linkPath ? linkPath.match(/\/(\d+)(\/)?$/) : null;
      const baseId = idMatch ? idMatch[1] : `unknown-${i}`;
      const id = `day${day}-${baseId}`;

      const title = $(el).find('h3.card-headline__title').text().trim();
      const subtitle = $(el).find('.card-headline__subtitle').text().trim();
      const image = $(el).find('img').attr('src');
      const date = $(el).find('.date-element__date').text().trim();

      // Clean duplicated time text like "17:00 Uhr17:00 Uhr"
      let timeText = $(el).find('.date-element__time').text().trim();
      const match = timeText.match(/^(\d{1,2}:\d{2}\s*Uhr)/);
      const time = match ? match[1] : timeText;

      const description = $(el).find('.event-item__description').text().trim();
      const link = 'https://www.donaufestival.at' + linkPath;

      events.push({ id, title, subtitle, image, date, time, description, link });
    });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch events');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});