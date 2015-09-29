module HealthChecking
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
      
      def perform(deps)
        deps[:logged_in]
      end
    end
  end
end
