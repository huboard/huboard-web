module HealthChecking
  module HealthChecks
    module Board
      class IssueReadyLabelCheck
        include HealthCheck
        name 'issue_ready_label_check'
        weight :warning
        authorization :collaborator
        passed "'Ready' label is present"
        failed "'Ready' label is not present"

        ## deps
        # {
        #   board: board object,
        #   authorization: :all, :collaborator or :admin
        #   logged_in: bool
        # }
        ##

        def perform(deps)
          return deps[:board].other_labels.any?{|label| label['name'].downcase === 'ready'}
        end
         
        def treat(deps)
          return deps[:board].create_label({name: 'ready', color: '22d186'})
        end
      end
    end
  end
end

