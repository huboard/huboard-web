module Api
  class IssuesUnlabelIssueJob < IssueEventJob
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_unlabeled"

    def payload(params)
      { issue: params[:issue] }
    end
  end
end
