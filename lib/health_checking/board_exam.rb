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
      treatment_class = "HealthChecking::HealthChecks::Board::#{@deps[:name].classify}".safe_constantize
      treatment_class.nil? ? [] : [treatment_class]
    end

    @@checks = [
      HealthChecks::Board::IssuesWebhookCheck,
      HealthChecks::Board::IssueCommentWebhookCheck,
    ]

  end
end
