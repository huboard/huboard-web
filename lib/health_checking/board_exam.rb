module HealthChecking
  class BoardExam

    attr_reader :deps
    def initialize(deps)
      @deps = deps
    end

    def checks
      @@checks
    end

    ## A bit hacky right now but easily cleaned up
    # we need the concept of test dependencies
    # doesn't make sense to fix an unhealth webhook
    # if it doesn't exist
    def treatments
      case @deps[:name]
      when "github_repo_webhooks_check"
        then [ 
          HealthChecks::GithubRepoWebhooksCheck,
        ]
      when "github_repo_webhook_healthy_check"
        then [ 
          HealthChecks::GithubRepoWebhooksCheck,
          HealthChecks::GithubRepoWebhookHealthyCheck,
        ]
      else
        []
      end
    end

    @@checks = [
      HealthChecks::GithubRepoWebhooksCheck,
      HealthChecks::GithubRepoWebhookHealthyCheck,
      HealthChecks::IssueCommentableCheck,
    ]

  end
end
