const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function crawlEvents(day, date) {
  try {

    const dayParam = 244 + day;
    const url = `https://www.donaufestival.at/de/programm?tag=${dayParam}&date=${date}`;
  
    const options = new chrome.Options().addArguments("--headless");
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  
    await driver.get(url);
  
    let containerSelector = ".event-list__items";
    let eventSelector = ".event-item";
    if (day == 5) {
      containerSelector =
        "#main-content > div.event-overview-page.grid-container > div > div.event-list > section:nth-child(2) > ul";
    }
  
    const container = await driver.findElement(By.css(containerSelector));
    const eventItems = await container.findElements(By.css(eventSelector));
  
    const results = [];
  
    for (const item of eventItems) {
      const event = await parseEventItem(day, item);
      results.push(event);
    }
  
    console.log(results);
  
    return results;
  } finally {
    try {
      await driver.quit();
    } catch(e) {
      console.error('Failed to quit driver', e);
    }    
  }
}

async function parseEventItem(day, item) {
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

  const title = await getTextOrNull(".card-headline__title");
  const description = await getTextOrNull(".event-item__description > p");
  const subtitle = await getTextOrNull(".card-headline__subtitle");
  const link = await getAttrOrNull(".event-item__link", "href");

  const id = link ? link.split("/").pop() : null;

  const venue = trim(await getTextOrNull(".labels__item--venue"));
  const room = await getTextOrNull(".labels__item--room");
  const image = await getAttrOrNull("figure img", "src");

  const event = {
    id: id,
    day: day,
    title: title,
    subtitle: subtitle,
    date,
    time,
    description: description,
    tags: [],
    venue: venue,
    room: room,
    image: image,
    link: link,
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
