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
      treatments = []
      @deps[:names].each do |name|
        treatment_class = "HealthChecking::HealthChecks::Board::#{name.classify}".safe_constantize
        treatments << treatment_class unless treatment_class.nil?
      end
      return treatments
    end

    @@checks = [
      HealthChecks::Board::IssuesWebhookCheck,
      HealthChecks::Board::IssueCommentWebhookCheck,
      HealthChecks::Board::PullRequestWebhookCheck,
      HealthChecks::Board::IssueBlockedLabelCheck,
      HealthChecks::Board::IssueReadyLabelCheck
    ]

  end
end
