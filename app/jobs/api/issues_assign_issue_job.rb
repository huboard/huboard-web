module Api
  class IssuesAssignIssueJob < IssueEventJob
    include IsPublishable
    action 'assigned'
    timestamp ->(params) { params[:issue]['updated_at'] }
    cache_key ->(message) {
      "assigned.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}"
    }

    def payload(params)
      {
        issue: params[:issue],
        assignees: params[:issue]["assignees"]
      }
    end
  end
end

