# Discord Notifier GitHub Action

This GitHub Action, named Discord Notifier, allows you to send message notifications to a Discord channel. It's useful for keeping your team informed about the status of builds, tests, and other project-related events directly within Discord.

# Usage

```yaml
- uses: quinck-io/actions-notify-discord@v2.0.2
  with:
      # [Required] Discord Webhook URL
      # use secrets: i.e. ${{ secrets.DISCORD_WEBHOOK }}
      webhookUrl: ''

      # [Required] Status of the build
      # i.e. ${{ job.status }}
      status: ''

      # [Required] Name of the project
      projectName: ''

      # [Optional] URL to test results
      testResultsUrl: ''

      # [Optional] SonarCloud project key
      sonarProjectKey: ''

      # [Optional] Status of the SonarCloud Quality Gate
      sonarQualityGateStatus: ''

      # [Optional] Username to display in the message
      # Default: GitHub Actions
      username: ''

      # [Optional] URL to the avatar image
      # Default: https://cdn-icons-png.flaticon.com/512/25/25231.png
      avatarUrl: ''
```

# Scenarios

## Just pipeline result

```yaml
- uses: quinck-io/actions-notify-discord@v2.0.2
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      status: ${{ job.status }}
      projectName: 'your project name'
```

## With Tests

```yaml
- uses: quinck-io/actions-notify-discord@v2.0.2
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      status: ${{ job.status }}
      projectName: 'your project name'
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

- uses: quinck-io/actions-notify-discord@v2.0.2
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      status: ${{ job.status }}
      projectName: 'your project name'
      testResultsUrl: ${{ steps.testsreport.outputs.url_html }}
```

## With Sonar

```yaml
- uses: quinck-io/actions-notify-discord@v2.0.2
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      status: ${{ job.status }}
      projectName: 'your project name'
      sonarProjectKey: 'your sonar project key'
      sonarQualityGateStatus: 'sonar quality gate status'
```

### Using sonarsource actions

```yaml
- uses: SonarSource/sonarcloud-github-action@master
  env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

- id: sonarqube-quality-gate-check
  uses: sonarsource/sonarqube-quality-gate-action@master
  timeout-minutes: 5
  env:
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SONAR_HOST_URL: https://sonarcloud.io

- uses: quinck-io/actions-notify-discord@v2.0.2
  with:
      webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
      status: ${{ job.status }}
      projectName: ${{ env.PROJECT_NAME }}
      testResultsUrl: ${{ steps.testsreport.outputs.url_html }}
      sonarProjectKey: 'your project name'
      sonarQualityGateStatus: ${{ steps.sonarqube-quality-gate-check.outputs.quality-gate-status }}
```
