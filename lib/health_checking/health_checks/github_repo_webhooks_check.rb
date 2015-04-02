module HealthChecks
  class GithubRepoWebhooksCheck
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
    
    def perform(deps)

    end
  end
end
