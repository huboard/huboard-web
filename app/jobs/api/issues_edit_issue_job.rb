module Api
  class IssuesEditIssueJob < IssueEventJob
    #include IsPublishable
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_edited"

    def payload(params)
      { issue: params[:issue] }
    end
  end
end
