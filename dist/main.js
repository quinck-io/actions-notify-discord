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
var successIcons = [":unicorn:", ":man_dancing:", ":ghost:", ":dancer:", ":scream_cat:"];
var failureIcons = [":fire:", "dizzy_face", ":man_facepalming:", ":poop:", ":skull:"];
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

// src/discord.ts
var getFooterText = (params) => {
  const { event } = params;
  if (!event?.head_commit)
    return void 0;
  return `
Commit: ${event.head_commit.timestamp}
Message: ${event.head_commit.message}
Hash: ${event.head_commit.id.slice(0, 7)}
`;
};
var getTestMessage = (params) => {
  if (!params.testResultsUrl)
    return void 0;
  return `Test Results: [View Results](${params.testResultsUrl})`;
};
var getSonarMessage = (params) => {
  const { sonarProjectKey: sonarProjectKey2, sonarQualityGateStatus: sonarQualityGateStatus2, refName: refName2 } = params;
  const sonarMessage = [];
  if (sonarProjectKey2) {
    const sonarUrl = `https://sonarcloud.io/summary/new_code?id=${sonarProjectKey2}&branch=${refName2}`;
    sonarMessage.push(`SonarCloud: [View Report](${sonarUrl})`);
  }
  if (sonarQualityGateStatus2)
    sonarMessage.push(`Quality Gate: *${sonarQualityGateStatus2}*`);
  if (sonarMessage.length <= 0)
    return void 0;
  return sonarMessage.join("\n");
};
var getJobStatusMessage = (params, statusIcon) => `
${statusIcon} Status: *${params.status.toUpperCase()}*
${process.env.GITHUB_WORKFLOW}: ${process.env.GITHUB_JOB}`;
var stringOrDefault = (str, def) => str ? str : def;
async function sendDiscordWebhook(params) {
  const { webhookUrl: webhookUrl2, status: status2, projectName: projectName2, refName: refName2, event } = params;
  const author = event?.head_commit?.author?.name ?? "Unknown";
  const { statusIcon, statusMessage } = status2 === "success" ? getStatusInfo(successIcons, successMessages(author)) : getStatusInfo(failureIcons, failureMessages(author));
  const jobStatusMessage = getJobStatusMessage(params, statusIcon);
  const testMessage = getTestMessage(params);
  const sonarMessage = getSonarMessage(params);
  const descs = [jobStatusMessage, sonarMessage, testMessage, statusMessage];
  const embedDescription = descs.filter((desc) => desc !== void 0).join("\n\n");
  const footerText = getFooterText(params);
  const embed = {
    title: `${projectName2}/${refName2}`,
    url: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    description: embedDescription,
    color: getColor(status2)
  };
  if (footerText)
    embed["footer"] = { text: footerText };
  const username2 = stringOrDefault(params.username, "GitHub Actions");
  const avatar_url = stringOrDefault(params.avatarUrl, "https://cdn-icons-png.flaticon.com/512/25/25231.png");
  const body = JSON.stringify({
    username: username2,
    avatar_url,
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

// src/main.ts
var required = (obj) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (!value)
      throw new Error(`Required parameter ${key} is not set.`);
  });
  return obj;
};
var webhookUrl = process.env.INPUT_WEBHOOKURL;
var status = process.env.INPUT_STATUS;
var projectName = process.env.INPUT_PROJECTNAME;
var testResultsUrl = process.env.INPUT_TESTRESULTSURL;
var sonarProjectKey = process.env.INPUT_SONARPROJECTKEY;
var sonarQualityGateStatus = process.env.INPUT_SONARQUALITYGATESTATUS;
var eventPath = process.env.GITHUB_EVENT_PATH;
var refName = process.env.GITHUB_REF_NAME;
var avatarUrl = process.env.INPUT_AVATARURL;
var username = process.env.INPUT_USERNAME;
var reqInputs = required({
  webhookUrl,
  status,
  projectName,
  eventPath,
  refName
});
var work = async () => {
  const event = JSON.parse(import_fs.default.readFileSync(reqInputs.eventPath, "utf8"));
  await sendDiscordWebhook({
    webhookUrl: reqInputs.webhookUrl,
    status: reqInputs.status,
    projectName: reqInputs.projectName,
    refName: reqInputs.refName,
    event,
    testResultsUrl,
    sonarProjectKey,
    sonarQualityGateStatus,
    avatarUrl,
    username
  });
};
work().catch((err) => {
  console.error(err);
  process.exit(1);
});
