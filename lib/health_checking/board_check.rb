module HealthChecking
  class BoardCheck

    attr_reader :deps
    def initialize(deps)
      @deps = deps
    end

    def checks
      @@checks
    end

    @@checks = [
      HealthChecks::GitHubRepoWebhooks,
      HealthChecks::IssueCommentable,
    ]

  end
end
