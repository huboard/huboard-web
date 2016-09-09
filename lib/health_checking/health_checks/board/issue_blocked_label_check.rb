module HealthChecking
  module HealthChecks
    module Board
      class IssueBlockedLabelCheck
        include HealthCheck
        name 'issue_blocked_label_check'
        weight :warning
        authorization :collaborator
        passed "'Blocked' label is present"
        failed "'Blocked' label is not present"

        ## deps
        # {
        #   board: board object,
        #   authorization: :all, :collaborator or :admin
        #   logged_in: bool
        # }
        ##

        def perform(deps)
          return deps[:board].other_labels.any?{|label| label['name'].downcase === 'blocked'}
        end
         
        def treat(deps)
          return deps[:board].create_label({name: 'blocked', color: 'f9646e'})
        end
      end
    end
  end
end

