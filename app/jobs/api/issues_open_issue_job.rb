module Api
  class IssuesOpenIssueJob < IssueEventJob
    include IsPublishable
    action "issue_opened"
    timestamp ->(params) { params[:issue]['created_at']}

    def payload(params)
      {
        pull_request: params[:pull_request],
        issue: params[:issue]
      }
    end

  end
end
