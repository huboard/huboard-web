module Api
  class IssuesUnassignIssueJob < IssueEventJob
    include IsPublishable
    action 'unassigned'
    timestamp ->(params) { params[:issue]['updated_at'] }
    cache_key ->(message) {
      "assigned.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}"
    }

    def payload(params)
      {
        issue: params[:issue]
      }
    end
  end
end

