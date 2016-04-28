module Api
  class IssuesUnlabelIssueJob < IssueEventJob
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_unlabeled"
    cache_key ->(message) {
      label_name = message[:payload][:label] ? message[:payload][:label]['name'] : ""

      "#{message[:meta][:action]}.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}.#{ label_name }"
    }

    def payload(params)
      {
        issue: params[:issue],
        label: params[:label]
      }
    end
  end
end
