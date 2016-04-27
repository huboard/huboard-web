module Api
  class IssuesUnlabelIssueJob < IssueEventJob
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_unlabeled"
    cache_key ->(message) {
      "#{message[:meta][:action]}.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}.#{ message[:payload][:label] }"
    }

    def payload(params)
      {
        issue: params[:issue],
        label: params[:label]
      }
    end
  end
end
