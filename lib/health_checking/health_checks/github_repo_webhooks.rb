module HealthChecker
  module HealthChecks
    class GitHubRepoWebhooks
      include HealthCheck

      weight :warning
      authorization :collaborator

      ## deps
      # {
      #   repo: repo object,
      #   authorization: (:all, :collaborator, :admin),
      #   logged_in: bool
      # }
      
      def self.perform(deps)
        return {message: "Not Authorized"} unless authorized?(deps)
      end

    end
  end
end
