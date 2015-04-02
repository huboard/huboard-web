module HealthChecking
  class BoardExam

    attr_reader :deps
    def initialize(deps)
      @deps = deps
    end

    def checks
      @@checks
    end

    @@checks = [
      HealthChecks::GitHubRepoWebhooksCheck,
      HealthChecks::IssueCommentableCheck,
    ]

  end
end
