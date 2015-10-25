module Api
  class IssuesUnassignIssueJob < IssueEventJob
    include IsPublishable
    action 'unassigned'
    timestamp Proc.new { Time.now.utc.iso8601}
    def payload(params)
      {
        issue: params[:issue]
      }
    end
  end
end

