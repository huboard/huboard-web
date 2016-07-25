module Api
  class IssuesAssignIssueJob < IssueEventJob
    include IsPublishable
    action 'assigned'
    timestamp ->(params) { params[:issue]['updated_at'] }
    cache_key ->(message) {
      assignee = message[:payload][:assignee]['login'] ? message[:payload][:assignee]['login'] : message[:payload][:assignee]
      "assigned.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}.#{assignee}"
    }

    def payload(params)
      {
        issue: params[:issue],
        assignee: params[:assignee]
      }
    end
  end
end

