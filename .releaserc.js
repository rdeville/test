// in ".releaserc.js" or "release.config.js"

const { promisify } = require("util");
const dateFormat = require("dateformat");
const readFileAsync = promisify(require("fs").readFile);
const path = require("path");

const gitmojis = require("gitmojis").gitmojis;

const TEMPLATE_DIR = "./.semantic-release/templates/";
const template = readFileAsync(path.join(TEMPLATE_DIR, "default-template.hbs"));

const MAJOR = "major";
const MINOR = "minor";
const PATCH = "patch";

module.exports = {
  branches: ["main"],
  plugins: [
    [
      "semantic-release-gitmoji",
      {
        releaseRules: {
          major: gitmojis
            .filter(({ semver }) => semver === MAJOR)
            .map(({ emoji }) => emoji),
          minor: gitmojis
            .filter(({ semver }) => semver === MINOR)
            .map(({ emoji }) => emoji),
          patch: gitmojis
            .filter(({ semver }) => semver === PATCH)
            .map(({ emoji }) => emoji),
          others: gitmojis
            .filter(({ semver }) => semver === null)
            .map(({ emoji }) => emoji),
        },
        releaseNotes: {
          template,
          // partials: {commitTemplate},
          semver: true,
          helpers: {
            datetime: function (format = "UTC:yyyy-mm-dd") {
              return dateFormat(new Date(), format);
            },
          },
          issueResolution: {
            template: "{baseUrl}/{owner}/{repo}/issues/{ref}",
            baseUrl: "https://github.com",
          },
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# CHANGELOG",
      },
    ],
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message: "🔖 ${nextRelease.version} [skip-ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
  tagFormat: "${version}",
};
