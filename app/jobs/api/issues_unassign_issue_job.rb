module Api
  class IssuesUnassignIssueJob < IssueEventJob
    include IsPublishable
    action 'unassigned'
    timestamp ->(params) { params[:issue]['updated_at'] }
    cache_key ->(message) {
      assignee = message[:payload][:assignee]['login'] ? message[:payload][:assignee]['login'] : message[:payload][:assignee]
      "unassigned.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}.#{assignee}"
    }

    def payload(params)
      {
        issue: params[:issue],
        assignee: params[:assignee]
      }
    end
  end
end

