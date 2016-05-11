module Api
  class IssuesAssignIssueJob < IssueEventJob
    include IsPublishable
    action 'assigned'
    timestamp ->(params) { params[:issue]['updated_at'] }
    def payload(params)
      {
        issue: params[:issue],
        assignee: params[:issue]["assignee"]
      }
    end
  end
end

