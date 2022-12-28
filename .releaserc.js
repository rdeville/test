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
const RULES = {
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
};

module.exports = {
  branches: ["main"],
  plugins: [
    [
      "semantic-release-gitmoji",
      {
        releaseRules: RULES,
        releaseNotes: {
          template,
          // partials: {commitTemplate},
          helpers: {
            datetime: function (format = "UTC:yyyy-mm-dd") {
              return dateFormat(new Date(), format);
            },
            commitlist: function (commits, options) {
              let commitlist = {};
              let currRule = "";
              const rules = RULES;
              for (const iGitmoji in commits) {
                currRule = "";
                for (const iRule in rules) {
                  console.log(iRule);
                  console.log(rules[iRule]);
                  console.log(iGitmoji);
                  if (iGitmoji in rules[iRule]) {
                    console.log("===");
                    if (Object.prototype.hasOwnProperty.call(commitlist, iRule))
                      commitlist[iRule] = [];
                    currRule = iRule;
                  }
                }
                for (
                  let idxCommit = 0;
                  idxCommit < commits[iGitmoji].length;
                  idxCommit++
                ) {
                  commitlist[currRule].push(commits[iGitmoji][idxCommit]);
                }
              }
              options.data.root["commits"] = commitlist;
              console.log(options.data.root);
            },
            isSemver: function (gitmojiSemver, rtype) {
              if (gitmojiSemver == rtype) return true;
              return false;
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
