module HealthChecking
  module HealthChecks
    module Board
      class IssueCommentWebhookCheck
        include HealthCheck
        name 'issue_comment_webhook_check'
        weight :error
        authorization :admin
        passed "GitHub webhook for the issue_comment event is installed"
        failed "GitHub webhook for the issue_comment event is missing"

        ## deps
        # {
        #   board: board object,
        #   authorization: :all, :collaborator or :admin
        #   logged_in: bool
        # }
        ##

        def perform(deps)
          return deps[:board].hook_issue_comment_exist?
        end
         
        def treat(deps)
          return deps[:board].hook_issue_comment_exist? || deps[:board].create_issue_comment_hook
        end
      end
    end
  end
end

