module Api
  class IssuesReopenAndMoveJob < IssueEventJob
    include IsPublishable
    action "reopened_and_moved"
    timestamp Proc.new { Time.now.utc.iso8601}

    def payload(params)
      {
        issue: params[:issue],
        column: params[:issue]['current_state'],
        previous: params[:previous_column]
      }
    end
  end
end
