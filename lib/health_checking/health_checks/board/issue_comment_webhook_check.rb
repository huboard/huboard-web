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
          hooks = deps[:hooks]
          event_name = "issue_comment"

          url = ENV['GITHUB_WEBHOOK_ENDPOINT']
          hook_url = File.join(url, 'webhook', event_name).downcase
          hooks.map { |x| x['config']['url'].downcase }.include? hook_url
        end
         
        def treat(deps)
          perform(deps) || deps[:board].create_issue_comment_hook
        end
      end
    end
  end
end

