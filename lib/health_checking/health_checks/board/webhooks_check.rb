
module HealthChecking
  module HealthChecks
    module Board
      class WebhooksCheck
        def initialize(context)
          @context = context
        end
        def check
          hooks = @context[:board].hooks
          @context[:hooks] = hooks
          exam = Exam.new @context
          HealthChecking::Doctor.new(exam).check
        end
        def treatment
          hooks = @context[:board].hooks
          @context[:hooks] = hooks
          exam = Exam.new @context
          HealthChecking::Doctor.new(exam).treat
        end
      end
      class Exam
        attr_reader :deps
        def initialize(deps)
          @deps = deps
        end
        def checks
          [
            HealthChecks::Board::IssuesWebhookCheck,
            HealthChecks::Board::IssueCommentWebhookCheck,
            HealthChecks::Board::PullRequestWebhookCheck
          ]
        end
        def treatments
          treatments = []
          @deps[:names].each do |name|
            if /webhook_check/ =~ name
              treatment_class = "HealthChecking::HealthChecks::Board::#{name.classify}".safe_constantize
              treatments << treatment_class unless treatment_class.nil?
            end
          end
          return treatments
        end
      end
    end
  end
end
