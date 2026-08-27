# Discord Notifier GitHub Action

This GitHub Action, named Discord Notifier, allows you to send message notifications to a Discord channel. It's useful for keeping your team informed about the status of builds, tests and deployments directly within Discord.

You pass it the `needs` context of your notification job and it derives the overall status and the list of failed jobs for you. There is no status-aggregation step to write.

# Usage

Add a job that depends on the jobs you want to report, runs with `if: always()`, and pass the `needs` context as JSON:

```yaml
send-notification:
    name: Send Discord notification
    runs-on: ubuntu-latest
    needs: [build, lint, test, deploy] # the jobs whose result you want reported
    if: always()
    steps:
        - uses: quinck-io/actions-notify-discord@v5
          with:
              # [Required] Discord Webhook URL
              # use secrets: i.e. ${{ secrets.DISCORD_WEBHOOK }}
              webhookUrl: ''

              # [Required] Name of the project
              projectName: ''

              # [Required] The needs context, JSON encoded
              # always pass ${{ toJson(needs) }}
              needs: ''

              # [Optional] URL to test results
              testResultsUrl: ''

              # [Optional] Show only the head commit instead of every commit
              # of the push. Only applies to push events
              # Default: false
              onlyHeadCommit: ''

              # [Optional] Order of the commit list: newest-first or oldest-first
              # Default: newest-first
              commitOrder: ''

              # [Optional] Add the ISO date of each commit to the commit list
              # Default: false
              showCommitDates: ''

              # [Optional] SonarCloud project key
              sonarProjectKey: ''

              # [Optional] SonarCloud url
              sonarUrl: ''

              # [Optional] Status of the SonarCloud Quality Gate
              sonarQualityGateStatus: ''

              # [Optional] Username to display in the message
              # Default: Github Action
              username: ''

              # [Optional] URL to the avatar image
              # Default: https://cdn-icons-png.flaticon.com/512/25/25231.png
              avatarUrl: ''
```

## Status

The overall status is computed from the result of every job in `needs`:

- if any job failed, the status is `failure`
- else if any job was cancelled, the status is `cancelled`
- else the status is `success`

Skipped jobs are ignored: a job skipped by an `if:`, event or branch condition does not downgrade the status. This matches how GitHub concludes a run. The names of the failed jobs are collected automatically and shown in the message.

## Message format

The message is one embed:

- a header line with the workflow and job name, then the status and a fixed status icon
- a **Commits** section under it: one line per commit with the linked short hash and the first line of the commit message
- the optional **Test Results** and SonarCloud fields last

The header and the commit list live in the embed description rather than in fields: a field value caps at 1024 characters, so a long list would be split across several fields and Discord renders a visible gap between them.

By default every commit of the push is shown, newest first. GitHub caps the push payload at 20 commits. Lists that would pass Discord's 4096 character description cap are truncated with an "…and N more commits" note. Pull request events have no commit list.

Three inputs control the section:

- `onlyHeadCommit: 'true'` shows only the head commit, with the same line format
- `commitOrder: 'oldest-first'` reverses the order
- `showCommitDates: 'true'` adds the ISO date of each commit to its line

# Scenarios

## Only the head commit

```yaml
- uses: quinck-io/actions-notify-discord@v5
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      onlyHeadCommit: 'true'
```

## Just pipeline result

```yaml
- uses: quinck-io/actions-notify-discord@v5
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
```

## With Tests

```yaml
- uses: quinck-io/actions-notify-discord@v5
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      testResultsUrl: 'url to test results'
```

### Using dorny/test-reporter

```yaml
- uses: dorny/test-reporter@v1
  id: testsreport
  with:
      name: Unit Tests
      path: 'test-results.json'
      reporter: mocha-json

- uses: quinck-io/actions-notify-discord@v5
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      testResultsUrl: ${{ steps.testsreport.outputs.url_html }}
```

## With Sonar

```yaml
- uses: quinck-io/actions-notify-discord@v5
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      sonarProjectKey: 'your sonar project key'
      sonarQualityGateStatus: 'sonar quality gate status'
```

Notes:

- the `status` and `failedJob` inputs were removed, they are now derived from `needs`
- `skipped` no longer downgrades the status (v3 reported `skipped` if any job was skipped, v4 treats it as neutral, matching GitHub)
- pipelines still pinned to `@v3` keep working unchanged

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and releasing.
