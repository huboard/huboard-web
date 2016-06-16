module Api
  class IssuesUnassignIssueJob < IssueEventJob
    include IsPublishable
    action 'unassigned'
    timestamp ->(params) { params[:issue]['updated_at'] }
    cache_key ->(message) {
      assignees = message[:payload][:assignees].map{|assignee| assignee[:login] }.to_s
      "unassigned.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}.#{assignees}"
    }

    def payload(params)
      {
        issue: params[:issue],
        assignees: params[:issue]["assignees"]
      }
    end
  end
end

