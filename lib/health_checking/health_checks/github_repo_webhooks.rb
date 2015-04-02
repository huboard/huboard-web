module HealthChecks
  class GitHubRepoWebhooksCheck
    include HealthCheck

    name 'github_repo_webhooks'
    weight :warning
    authorization :collaborator
    message "Click <a href='/some/place'> Here </a> to fix"

    ## deps
    # {
    #   repo: repo object,
    #   authorization: :all, :collaborator or :admin
    #   logged_in: bool
    # }
    ##
    
    def self.perform(deps)
      return not_authorized unless authorized?(deps)
      #Perform the actual Health Check
    end

    :private
      def self.pass
        {
          name: @name,
          pass: true
        }
      end

      def self.failure
        {
          name: @name,
          weight: @weight,
          message: @message,
          pass: false
        }
      end

      def self.not_authorized
        {
          name: @name,
          message: 'Not Authorized'
        }
      end

  end
end
