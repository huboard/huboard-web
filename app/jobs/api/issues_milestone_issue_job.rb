module Api
  class IssuesMilestoneIssueJob < IssueEventJob
    #include IsPublishable
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_edited"

    def payload(params)
      { issue: params[:issue] }
    end
  end
end

