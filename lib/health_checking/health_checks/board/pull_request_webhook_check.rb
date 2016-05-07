module HealthChecking
  module HealthChecks
    module Board
      class PullRequestWebhookCheck
        include HealthCheck
        name 'pull_request_webhook_check'
        weight :error
        authorization :admin
        passed "GitHub webhook for the pull request event is installed"
        failed "GitHub webhook for the pull request event is missing"

        ## deps
        # {
        #   board: board object,
        #   authorization: :all, :collaborator or :admin
        #   logged_in: bool
        # }
        ##

        def perform(deps)
          return deps[:board].hook_pull_request_exist?
        end

        def treat(deps)
          deps[:board].hook_pull_request_exist? || deps[:board].create_pull_request_hook
        end
      end
    end
  end
end

