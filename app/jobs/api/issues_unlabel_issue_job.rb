module Api
  class IssuesUnlabelIssueJob < IssueEventJob
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_unlabeled"

    def payload(params)
      {
        issue: params[:issue],
        label: params[:label]
      }
    end
  end
end
