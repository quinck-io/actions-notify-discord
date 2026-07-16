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
        - uses: quinck-io/actions-notify-discord@v4
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

-   if any job failed, the status is `failure`
-   else if any job was cancelled, the status is `cancelled`
-   else the status is `success`

Skipped jobs are ignored: a job skipped by an `if:`, event or branch condition does not downgrade the status. This matches how GitHub concludes a run. The names of the failed jobs are collected automatically and shown in the message.

# Scenarios

## Just pipeline result

```yaml
- uses: quinck-io/actions-notify-discord@v4
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
```

## With Tests

```yaml
- uses: quinck-io/actions-notify-discord@v4
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

- uses: quinck-io/actions-notify-discord@v4
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      testResultsUrl: ${{ steps.testsreport.outputs.url_html }}
```

## With Sonar

```yaml
- uses: quinck-io/actions-notify-discord@v4
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
      sonarProjectKey: 'your sonar project key'
      sonarQualityGateStatus: 'sonar quality gate status'
```

# Migrating from v3

In v3 you had to compute the status yourself, usually with a hand-written step in every workflow:

```yaml
# no longer needed in v4
- name: Determine Overall Status
  id: check-status
  run: |
      if ${{ contains(needs.*.result, 'failure') }}; then
        echo "status=failure" >> $GITHUB_OUTPUT
      elif ${{ contains(needs.*.result, 'cancelled') }}; then
        echo "status=cancelled" >> $GITHUB_OUTPUT
      elif ${{ contains(needs.*.result, 'skipped') }}; then
        echo "status=skipped" >> $GITHUB_OUTPUT
      else
        echo "status=success" >> $GITHUB_OUTPUT
      fi
      echo "failed_jobs=$(echo '${{ toJson(needs) }}' | jq -r 'to_entries[] | select(.value.result == "failure") | .key')" >> $GITHUB_OUTPUT

- uses: quinck-io/actions-notify-discord@v3
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      status: ${{ steps.check-status.outputs.status }}
      projectName: 'your project name'
      failedJob: ${{ steps.check-status.outputs.failed_jobs }}
```

In v4 you delete that whole step and pass `needs` instead:

```yaml
- uses: quinck-io/actions-notify-discord@v4
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      projectName: 'your project name'
      needs: ${{ toJson(needs) }}
```

Notes:

-   the `status` and `failedJob` inputs were removed, they are now derived from `needs`
-   `skipped` no longer downgrades the status (v3 reported `skipped` if any job was skipped, v4 treats it as neutral, matching GitHub)
-   pipelines still pinned to `@v3` keep working unchanged

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and releasing.
