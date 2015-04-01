module HealthChecker
  module HealthChecks
    class GitHubRepoWebhooks
      include HealthCheck

      weight :warning
      authorization :collaborator
      
      authorize!
      def self.perform(deps)

      end

    end
  end
end
