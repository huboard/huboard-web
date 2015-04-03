module HealthChecking
  module HealthChecks
    class GithubRepoWebhooksCheck
      include HealthCheck

      name 'github_repo_webhooks_check'
      weight :warning
      authorization :collaborator
      message "Click <a href='/some/place'> Here </a> to fix"

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
    end
  end
end
