const fs = require("fs");

const FEED_URL = "https://link.eduardoparra.es/rss.xml";
const MAX_ITEMS = 5;

const getLinks = async ({ core, fetch }) => {
  core.info("Getting links...");
  const xml = await fetch(FEED_URL).then((response) => response.text());

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
    ([, block]) => ({
      title: block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "",
      link: block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "",
      pubDate: block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "",
    })
  );

  return items
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_ITEMS);
};

const writeReadme = async ({ linksList, core }) => {
  core.info("Reading README...");
  const readme = await fs.readFileSync("./README.md", { encoding: "utf8" });

  const newReadme = readme.replace(
    /<!-- START_SECTION:links -->[\s\S]*<!-- END_SECTION:links -->/,
    `<!-- START_SECTION:links -->\n${linksList}\n<!-- END_SECTION:links -->`
  );
  core.info("Writing README...");

  fs.writeFileSync("./README.md", newReadme, { encoding: "utf8" });
};

const prepareForReadme = async ({ core, fetch }) => {
  const links = await getLinks({ core, fetch });
  core.info(`Received ${links.length} links`);

  if (links.length === 0) {
    await writeReadme({ linksList: "No resources added yet", core });
    return;
  }

  const linksList = links
    .map((link) => `- [${link.title}](${link.link})`)
    .join("\n");

  core.info(linksList);

  await writeReadme({ linksList, core });
};

module.exports = prepareForReadme;
