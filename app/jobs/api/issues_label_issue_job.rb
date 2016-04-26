module Api
  class IssuesLabelIssueJob < IssueEventJob
    include IsPublishable
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_labeled"

    def payload(params)
      {
        issue: params[:issue],
        label: params[:label]
      }
    end
  end
end
