const fs = require("fs");

const getBooks = async ({ core, fetch }) => {
  core.info("Getting books...");
  return fetch("https://soker90.github.io/libros/api.json").then((response) =>
    response
      .json()
      .then((data) =>
        data
          .map((book, id) => ({ ...book, id }))
          .filter((book) => book.state === "reading")
      )
  );
};

const writeReadme = async ({ booksList, core }) => {
  core.info("Reading README...");
  const readme = await fs.readFileSync("./README.md", { encoding: "utf8" });

  const newReadme = readme.replace(
    /<!-- START_SECTION:books -->[\s\S]*<!-- END_SECTION:books -->/,
    `<!-- START_SECTION:books -->\n${booksList}\n<!-- END_SECTION:books -->`
  );
  core.info("Writing README...");

  fs.writeFileSync("./README.md", newReadme, { encoding: "utf8" });
};

const prepareForReadme = async ({ core, fetch }) => {
  const books = await getBooks({ core, fetch });
  core.info(`Received ${books.length} books`);

  if (books.length === 0) {
    writeReadme({
      booksList: `### 📚 Currently reading\n\nNo books added yet`,
      core,
    });
    return;
  }

  const booksList = books
    .map(
      (book) =>
        `[![${book.title}](${book.image})](https://github.com/soker90/libros/issues/${book.id} "${book.title} by ${book.authors?.[0]}")`
    )
    .join("\n");

  core.info(booksList);

  await writeReadme({
    booksList: `### 📚 Currently reading\n\n${booksList}`,
    core,
  });
};

module.exports = prepareForReadme;
