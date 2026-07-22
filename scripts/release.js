const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { execSync } = require("child_process");

const argv = require("minimist")(process.argv.slice(2));
const { release, package } = argv;

const allowedReleases = ["canary", "patch", "minor", "major"];

if (!allowedReleases.includes(release))
  throw new Error(`You must specify a release type (--release=...): ${allowedReleases.join(", ")}`);

const allowedPackages = ["js", "js-components", "react", "react-components"];
if (!allowedPackages.includes(package))
  throw new Error(`You must specify a package (--package=...): ${allowedPackages.join(", ")}`);

const main = async () => {
  if (release === "canary") await exec(`pnpm ${package} version prerelease --preid=canary`);
  else await exec(`pnpm ${package} version ${release}`);

  execSync(`rm -rf workspaces/${package}/dist`, { stdio: "inherit" });
  execSync(`pnpm ${package} build`, { stdio: "inherit" });

  const currentVersion = require(`../workspaces/${package}/package.json`).version;
  const packageAndVersion = `@flows/${package}@${currentVersion}`;
  await exec(`git commit -am "${packageAndVersion}"`);
  await exec(`git tag -a ${packageAndVersion} -m '${packageAndVersion}'`);
  await exec("git push --no-verify");
  await exec(`git push --no-verify --tags`);

  execSync(
    `pnpm ${package} publish --access=public --provenance --no-git-checks ${release === "canary" ? "--tag=canary" : ""}`,
    { stdio: "inherit" },
  );
};

void main();
