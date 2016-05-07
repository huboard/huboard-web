module Api
  class IssuesAssignMilestoneJob < IssueEventJob
    include IsPublishable
    action 'milestone_changed'
    timestamp ->(params) { params[:issue]['updated_at'] }

    ## suppress if the milestone didn't change
    #
    before_perform :only_if_changed
    def only_if_changed
      params = arguments.first
      params[:suppress] = !params[:changed_milestones]
    end

    def payload(params)
      {
        suppress: params[:suppress],
        issue: params[:issue],
        milestone: params[:issue]['milestone']
      }
    end
  end
end

