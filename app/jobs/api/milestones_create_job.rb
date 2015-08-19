module Api
  class MilestonesCreateJob < MilestoneEventJob
    include IsPublishable
    action "milestone_created" 
    timestamp Proc.new { Time.now.utc.iso8601 }

    def payload(params)
      {
        milestone: params[:milestone]
      }
    end
  end
end
