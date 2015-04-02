module HealthChecks
  class IssueCommentableCheck
    include HealthCheck

    name 'issue_comment_check'
    weight :info
    authorization :all
    message 'Login if you want to comment on this boards issues'

    ## deps
    # {
    #   authorization: :all, :collaborator or :admin,
    #   logged_in: bool
    # }
    ##
    
    #Passing authorization implicity states that the user passes
    def perform(deps)
      true
    end
  end
end
