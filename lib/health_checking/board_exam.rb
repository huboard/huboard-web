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
        if /webhook_check/ =~ name
          treatment_class = HealthChecks::Board::WebhooksCheck
        else
          treatment_class = "HealthChecking::HealthChecks::Board::#{name.classify}".safe_constantize
        end

        if treatment_class == HealthChecks::Board::WebhooksCheck
          treatments << treatment_class unless treatments.include? HealthChecks::Board::WebhooksCheck
        else
          treatments << treatment_class unless treatment_class.nil?
        end
      end

      return treatments
    end

    @@checks = [
      HealthChecks::Board::WebhooksCheck,
      HealthChecks::Board::IssueBlockedLabelCheck,
      HealthChecks::Board::IssueReadyLabelCheck
    ]

  end
end
