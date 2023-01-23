// in ".releaserc.js" or "release.config.js"

const { promisify } = require("util");
const dateFormat = require("dateformat");
const readFileAsync = promisify(require("fs").readFile);
const path = require("path");

const gitmojis = require("gitmojis").gitmojis;

const TEMPLATE_DIR = "./.semantic-release/templates/";
const template = readFileAsync(path.join(TEMPLATE_DIR, "default-template.hbs"));
const commitTemplate = readFileAsync(
  path.join(TEMPLATE_DIR, "commit-template.hbs")
);

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
    .map(({ emoji }) => emoji)
    .filter((emoji) => emoji != "👷"),
};

module.exports = {
  branches: [
    "+([0-9])?(.{+([0-9]),x}).x",
    "release/main",
    "next",
    {
      name: "beta",
      prerelease: true,
    },
    {
      name: "alpha",
      prerelease: true,
    },
  ],
  // branches: ["main"],
  plugins: [
    [
      "semantic-release-gitmoji",
      {
        releaseRules: RULES,
        releaseNotes: {
          template,
          partials: { commitTemplate },
          helpers: {
            datetime: function (format = "UTC:yyyy-mm-dd") {
              return dateFormat(new Date(), format);
            },
            commitlist: function (commits, options) {
              let commitlist = {};
              let currRule = null;
              const rules = RULES;
              for (const iGitmoji in commits) {
                currRule = null;
                for (const iRule in rules) {
                  if (rules[iRule].includes(iGitmoji)) {
                    if (
                      !Object.prototype.hasOwnProperty.call(commitlist, iRule)
                    ) {
                      commitlist[iRule] = [];
                    }
                    currRule = iRule;
                    break;
                  }
                }
                if (currRule != null) {
                  for (
                    let idxCommit = 0;
                    idxCommit < commits[iGitmoji].length;
                    idxCommit++
                  ) {
                    commitlist[currRule].push(commits[iGitmoji][idxCommit]);
                  }
                }
                options.data.root["commits"] = commitlist;
              }
            },
            hasKey: function (object, key) {
              if (Object.prototype.hasOwnProperty.call(object, key))
                return true;
              return false;
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
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message:
          "🔖 Release ${nextRelease.version} [skip-ci] with CHANGELOG\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
  tagFormat: "${version}",
};
