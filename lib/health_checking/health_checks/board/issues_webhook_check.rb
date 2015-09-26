module HealthChecking
  module HealthChecks
    module Board
      class IssuesWebhookCheck
        include HealthCheck
        name 'issues_webhook_check'
        weight :error
        authorization :admin
        passed "GitHub Webhook for the issues event is installed"
        failed "GitHub Webhook for the issues event is missing"

        ## deps
        # {
        #   board: board object,
        #   authorization: :all, :collaborator or :admin
        #   logged_in: bool
        # }
        ##

        def perform(deps)
          return deps[:board].hook_issues_exist?
        end

        def treat(deps)
          deps[:board].hook_issues_exist? || deps[:board].create_issues_hook
        end
      end
    end
  end
end

