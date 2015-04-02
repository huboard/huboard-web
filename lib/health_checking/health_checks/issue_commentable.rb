module HealthChecks
  class IssueCommentableCheck
    include HealthCheck

    name 'issue_comment_check'
    weight :info
    authorization :all
    message 'Login if you want to comment on this boards issues'

    ## deps
    # {
    #   repo: repo object,
    #   authorization: :all, :collaborator or :admin,
    #   logged_in: bool
    # }
    ##
    
    def perform(deps)

    end
  end
end
