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
    
    def self.perform(deps)
      return not_authorized unless authorized?(deps)
      return pass if deps[:logged_in]
      return failure
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
