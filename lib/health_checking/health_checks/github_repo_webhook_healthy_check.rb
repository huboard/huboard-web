module HealthChecking
  module HealthChecks
    class GithubRepoWebhookHealthyCheck
      include HealthCheck

      name 'github_repo_webhook_healthy_check'
      weight :warning
      authorization :admin
      passed "GitHub Webhook is healthy and responsive"
      failed "GitHub Webhook is failing to post to HuBoard"

      ## deps
      # {
      #   board: board object,
      #   authorization: :all, :collaborator or :admin
      #   logged_in: bool
      # }
      ##
      
      def perform(deps)
        return false unless deps[:board].hook_exists?

        huboard_hook = deps[:board].hook
        return huboard_hook['last_response'] == healthy_response || 
          huboard_hook['last_response'] == unused_response
      end

      alias_method :treat, :perform

      :private
        def healthy_response
          {"code"=>200, "status"=>"active", "message"=>"OK"}
        end

        def unused_response
          {"code"=>nil, "status"=>"unused", "message"=>nil}
        end
    end
  end
end
