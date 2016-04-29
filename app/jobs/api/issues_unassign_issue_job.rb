module Api
  class IssuesUnassignIssueJob < IssueEventJob
    include IsPublishable
    action 'unassigned'
    timestamp ->(params) { params[:issue]['updated_at'] }
    def payload(params)
      {
        issue: params[:issue]
      }
    end
  end
end

