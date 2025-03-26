const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

let driver = null;
async function init() {
  const options = new chrome.Options().addArguments("--headless");
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

async function quit() {
  await driver.quit();
}

async function crawlEvents(day, date) {
  const url = `https://www.donaufestival.at/de/programm?tag=${day}&date=${date}`;

  if (!driver) {
    await init();
  }

  await driver.get(url);

  let containerSelector = ".event-list__items";
  let eventSelector = ".event-item";
  if (day == 249) {
    // day 5
    containerSelector =
      "#main-content > div.event-overview-page.grid-container > div > div.event-list > section:nth-child(2) > ul";
    //eventSelector = ".event-list__items";
  }

  const container = await driver.findElement(By.css(containerSelector));
  const eventItems = await container.findElements(By.css(eventSelector));

  const results = [];

  for (const item of eventItems) {
    const event = await parseEventItem(item);
    results.push(event);
  }

  console.log(results);

  return results;
}

async function parseEventItem(item) {
  const getTextOrNull = async (selector) => {
    try {
      const value = await item.findElement(By.css(selector)).getText();
      if (value) {
        return value;
      }
    } catch (e) {
      console.error("Failed to get text for selector", selector, e);
      return "";
    }
    try {
      const innerText = await item
        .findElement(By.css(selector))
        .getAttribute("innerText");
      return innerText;
    } catch (e) {
      console.error("Failed to get innerText for selector", selector, e);
      return "";
    }
  };

  const getAttrOrNull = async (selector, attr) => {
    try {
      return await item.findElement(By.css(selector)).getAttribute(attr);
    } catch {
      return null;
    }
  };

  const trim = (str) => str?.replace(/^\s+|\s+$|\n+/g, "");

  const rawDate = await getTextOrNull(".date-element__date");
  let date = rawDate;
  if (rawDate) {
    // Clean duplicated date text like "Fr 2 Mai 2025Fr 2 Mai 2025"
    const dateMatch = rawDate.match(/^(.+?)\1*$/);
    date = dateMatch ? dateMatch[1] : date;
  }

  const timeText = await getTextOrNull(".date-element__time");
  let time = timeText;
  if (timeText) {
    const match = timeText.match(/^(\d{1,2}:\d{2}\s*Uhr)/);
    time = match ? match[1] : timeText;
  }

  let title = await getTextOrNull(".card-headline__title");
  if (!title) {
    title = await getTextOrNull("h3.card-headline__title");
  }

  let description = '';
  try {
    description = await getTextOrNull(".event-item__description > p");
  }
  catch (e) {
    console.error("Failed to get description", e);
  }

  let subtitle = '';
  try {
    subtitle = await getTextOrNull(".card-headline__subtitle");
  }
  catch (e) {
    console.error("Failed to get subtitle", e);
  }
   
  const event = {
    title: title,
    subtitle: subtitle,
    date,
    time,
    description: description,
    tags: [],
    venue: trim(await getTextOrNull(".labels__item--venue")),
    room: await getTextOrNull(".labels__item--room"),
    image: await getAttrOrNull("figure img", "src"),
    link: await getAttrOrNull(".event-item__link", "href"),
  };

  // Full link
  if (event.link?.startsWith("/")) {
    event.link = `https://www.donaufestival.at${event.link}`;
  }

  // Tags
  const tagElements = await item.findElements(By.css(".labels__item--tag"));
  for (const tagEl of tagElements) {
    let tag = null;
    try {
      tag = await tagEl.getText();
    } catch (e) {
      tag = await tagEl.getAttribute("innerText");
    }
    if (tag) {
      event.tags.push(tag);
    }
  }

  return event;
}

exports.crawlEvents = crawlEvents;
