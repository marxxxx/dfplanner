const cheerio = require("./node_modules/cheerio/dist/commonjs");

function parseEvents(response, day) {
  const $ = cheerio.load(response.data);

  const events = [];

  $("ul > div.event-item").each((i, el) => {
    try {
      console.log("event found");
      const linkPath = $(el).find("a.event-item__link").attr("href");
      const idMatch = linkPath ? linkPath.match(/\/(\d+)(\/)?$/) : null;
      const baseId = idMatch ? idMatch[1] : `unknown-${i}`;
      const id = `day${day}-${baseId}`;

      const title = $(el).find("h3.card-headline__title").text().trim();
      console.log("-- event title", title);
      const subtitle = $(el).find(".card-headline__subtitle").text().trim();
      const image = $(el).find("img").attr("src");
      const rawDate = $(el).find(".date-element__date").text().trim();
      // Clean duplicated date text like "Fr 2 Mai 2025Fr 2 Mai 2025"
      const dateMatch = rawDate.match(/^(.+?)\1*$/);
      const date = dateMatch ? dateMatch[1] : date;

      // Clean duplicated time text like "17:00 Uhr17:00 Uhr"
      let timeText = $(el).find(".date-element__time").text().trim();
      const match = timeText.match(/^(\d{1,2}:\d{2}\s*Uhr)/);
      const time = match ? match[1] : timeText;

      const description = $(el).find(".event-item__description").text().trim();
      const link = "https://www.donaufestival.at" + linkPath;

      events.push({
        id,
        title,
        subtitle,
        image,
        date,
        time,
        description,
        link,
      });
    } catch (error) {
      console.error("Failed to parse event", el, error);
    }
  });

  return events;
}
exports.parseEvents = parseEvents;
