import { promises as fs } from "fs";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ["image"],
  },
});

const getLatestRecipes = () =>
  parser.parseURL("https://recetas.eduardoparra.es/rss.xml").then((data) => {
    console.log(data.items);
    return data.items;
  });

(async () => {
  const [readme, recipes, resources] = await Promise.all([
    fs.readFile("./README.md", { encoding: "utf-8" }),
    getLatestRecipes(),
  ]);

  // create latest articles markdown
  const latestArticlesMarkdown = recipes
    .toSorted((a, b) => {
      if (a.isoDate < b.isoDate) {
        return 1;
      }

      if (a.isoDate > b.isoDate) {
        return -1;
      }

      return 0;
    })
    .slice(0, 5)
    .map(
      ({ title, link, image, ...rest }) => `<div class="image-container">
    <a href='${link}' target="_blank">
        <img src='${
          image || "https://recetas.eduardoparra.es/assets/logo.svg"
        }' alt="Instagram photo" />
        <div class="image-title">${title}</div>
    </a>
</div>`
    )
    .join("\n");

  const newReadme = readme.replace(
    /<!-- START_SECTION:recipes -->[\s\S]*<!-- END_SECTION:recipes -->/,
    `<!-- START_SECTION:recipes -->\n<div class="image-grid">\n${latestArticlesMarkdown}\n</div>\n<!-- END_SECTION:recipes -->`
  );

  console.log(newReadme);
  await fs.writeFile("README.md", newReadme);
})();