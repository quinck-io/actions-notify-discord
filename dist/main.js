var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var import_fs = __toESM(require("fs"));

// src/utils.ts
var successIcons = [
  ":unicorn:",
  ":man_dancing:",
  ":ghost:",
  ":dancer:",
  ":scream_cat:"
];
var failureIcons = [
  ":fire:",
  "dizzy_face",
  ":man_facepalming:",
  ":poop:",
  ":skull:"
];
var successMessages = (author) => [
  `:champagne::champagne:Congrats **${author}**, you made it. :sunglasses::champagne::champagne:`,
  `:moyai::moyai:Mah man **${author}**, you made it. :women_with_bunny_ears_partying::moyai::moyai:`,
  `:burrito::burrito:**${author}**, you did well. :women_with_bunny_ears_partying::burrito::burrito:`,
  `:pig::pig: **${author}** You son of a bitch, you did it. :women_with_bunny_ears_partying::pig::pig:`,
  `:ferris_wheel::ferris_wheel:**${author}** You're great.:ferris_wheel::ferris_wheel: `
];
var failureMessages = (author) => [
  `:fire::fire:* **${author}**, You're an idiot!*:fire::fire:`,
  `:bomb::bomb:*${author}*, How could this happen?:bomb::bomb:`,
  `:pouting_cat: :pouting_cat: *${author}*, What the hell are you doing?:pouting_cat: :pouting_cat:`,
  `:face_vomiting::face_vomiting:*${author}*, This commit made my mom cry!:face_vomiting::face_vomiting:`,
  `:facepalm::facepalm:${author}, Come on, at least offer a coffee before making such a commit!:facepalm::facepalm:`
];
var getStatusInfo = (icons, messages) => ({
  statusIcon: icons[Math.floor(Math.random() * icons.length)],
  statusMessage: messages[Math.floor(Math.random() * messages.length)]
});
var getColor = (status2) => {
  switch (status2) {
    case "success":
      return 3066993;
    case "failure":
      return 15158332;
    default:
      return 0;
  }
};

// src/main.ts
async function sendDiscordWebhook({
  webhookUrl: webhookUrl2,
  status: status2,
  projectName: projectName2,
  refName,
  event,
  testResultsUrl: testResultsUrl2,
  sonarUrl: sonarUrl2,
  sonarQualityGateStatus: sonarQualityGateStatus2
}) {
  const { statusIcon, statusMessage } = status2 === "success" ? getStatusInfo(
    successIcons,
    successMessages(event.head_commit.author.name)
  ) : getStatusInfo(
    failureIcons,
    failureMessages(event.head_commit.author.name)
  );
  const testMessage = testResultsUrl2 ? `Test Results: [View Results](${testResultsUrl2})` : "";
  const sonarMessage = sonarUrl2 ? `SonarCloud: [View Report](${sonarUrl2})` : "";
  const sonarStatus = sonarQualityGateStatus2 ? `Quality Gate: *${sonarQualityGateStatus2}*` : "";
  const embedDescription = `
${statusIcon} Status: *${status2.toUpperCase()}*
${process.env.GITHUB_WORKFLOW}: ${process.env.GITHUB_JOB}

${testMessage}

${sonarMessage}
${sonarStatus}

${statusMessage}
`;
  const footerText = `
Commit: ${event.head_commit.timestamp}
Message: ${event.head_commit.message}
Hash: ${event.head_commit.id.slice(0, 7)}
`;
  const embed = {
    title: `${projectName2}/${refName}`,
    url: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    description: embedDescription,
    footer: {
      text: footerText
    },
    color: getColor(status2)
  };
  const body = JSON.stringify({
    username: "GitHub Actions",
    embeds: [embed]
  });
  await fetch(webhookUrl2, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}
var nameOf = (obj) => Object.keys(obj)[0];
var required = (obj) => {
  const name = nameOf(obj);
  if (!obj[name]) {
    throw new Error(`Required parameter ${name} is not set.`);
  }
  return obj[name];
};
var webhookUrl = process.env.INPUT_WEBHOOKURL;
var status = process.env.INPUT_STATUS;
var projectName = process.env.INPUT_PROJECTNAME;
var testResultsUrl = process.env.INPUT_TESTRESULTSURL;
var sonarUrl = process.env.INPUT_SONARURL;
var sonarQualityGateStatus = process.env.INPUT_SONARQUALITYGATESTATUS;
var eventPath = process.env.GITHUB_EVENT_PATH;
required({ webhookUrl });
required({ status });
required({ projectName });
required({ eventPath });
if (eventPath) {
  const refName = process.env.GITHUB_REF_NAME;
  const event = JSON.parse(import_fs.default.readFileSync(eventPath, "utf8"));
  sendDiscordWebhook({
    webhookUrl,
    status,
    projectName,
    refName,
    event,
    testResultsUrl,
    sonarUrl,
    sonarQualityGateStatus
  });
} else {
  console.log("GITHUB_EVENT_PATH environment variable is not set.");
}
