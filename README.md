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
        - uses: quinck-io/actions-notify-discord@v6
          with:
              # [Required] Discord Webhook URL
              # use secrets: i.e. ${{ secrets.DISCORD_WEBHOOK }}
              webhookUrl: ''

              # [Required] Name of the project
              projectName: ''

              # [Required] The needs context, JSON encoded
              # always pass ${{ toJson(needs) }}
              needs: ''

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

              # [Optional] Extra embed fields, one `Name: value` per line.
              # Values support Discord markdown, empty values drop the field
              fields: ''

              # [Optional] Render the extra fields inline, in up to three columns
              # Default: false
              inlineFields: ''

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
- the extra `fields` last, if any

The header and the commit list live in the embed description rather than in fields: a field value caps at 1024 characters, so a long list would be split across several fields and Discord renders a visible gap between them.

By default every commit of the push is shown, newest first. GitHub caps the push payload at 20 commits. Lists that would pass Discord's 4096 character description cap are truncated with an "…and N more commits" note. Pull request events have no commit list.

Three inputs control the section:

- `onlyHeadCommit: 'true'` shows only the head commit, with the same line format
- `commitOrder: 'oldest-first'` reverses the order
- `showCommitDates: 'true'` adds the ISO date of each commit to its line

## Extra fields

The `fields` input appends embed fields after the commit list, one `Name: value` per line:

```yaml
fields: |
    Test Results: [View](${{ steps.tests.outputs.url_html }})
    Quality Gate: **${{ needs.sonar.outputs.gate }}**
    Environment: staging
    Failing tests:
        login redirects to /home
        cart total rounds down
```

- the first `: ` splits name and value, so URLs in values are safe
- values support Discord markdown (links, bold, code), names do not
- indented lines continue the previous value on a new line, a line ending with `:` opens such a field
- a field whose value is empty is dropped, so a `${{ }}` expression that evaluates to nothing removes its field. That is how conditional fields work
- any other line is reported as a workflow warning and skipped, the notification is still sent

`inlineFields: 'true'` renders the fields side by side, in up to three columns, which suits short values.

Discord caps an embed at 25 fields, 256 characters per name, 1024 per value and 6000 overall. Anything over is truncated or dropped with a workflow warning.

# Scenarios

## Only the head commit

```yaml
- uses: quinck-io/actions-notify-discord@v6
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      onlyHeadCommit: 'true'
```

## Just pipeline result

```yaml
- uses: quinck-io/actions-notify-discord@v6
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
```

## With extra fields

Any step output or expression can become a field. Here a test report link, a SonarCloud link and a quality gate status:

```yaml
- uses: dorny/test-reporter@v1
  id: testsreport
  with:
      name: Unit Tests
      path: 'test-results.json'
      reporter: mocha-json

- uses: quinck-io/actions-notify-discord@v6
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      inlineFields: 'true'
      fields: |
          Test Results: [View](${{ steps.testsreport.outputs.url_html }})
          SonarCloud: https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY&branch=${{ github.head_ref || github.ref_name }}
          Quality Gate: **${{ needs.sonar.outputs.quality-gate-status }}**
```

If the test step is skipped its output is empty and the **Test Results** field is simply left out.

Notes:

- `testResultsUrl`, `sonarProjectKey`, `sonarUrl` and `sonarQualityGateStatus` were removed in v6, use `fields`
- the `status` and `failedJob` inputs were removed, they are now derived from `needs`
- `skipped` no longer downgrades the status (v3 reported `skipped` if any job was skipped, v4 treats it as neutral, matching GitHub)
- pipelines still pinned to `@v3` or `@v5` keep working unchanged

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and releasing.
