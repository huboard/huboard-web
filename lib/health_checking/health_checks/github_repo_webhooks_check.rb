module HealthChecking
  module HealthChecks
    class GithubRepoWebhooksCheck
      include HealthCheck

      name 'github_repo_webhooks_check'
      weight :error
      authorization :admin
      passed "GitHub Webhook is installed"
      failed "GitHub Webhook is missing"

      ## deps
      # {
      #   board: board object,
      #   authorization: :all, :collaborator or :admin
      #   logged_in: bool
      # }
      ##
      
      def perform(deps)
        deps[:board].hook_exists?
      end

      def treat(deps)
        deps[:board].create_hook
      end
    end
  end
end
