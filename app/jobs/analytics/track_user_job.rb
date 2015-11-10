module Analytics
  class TrackUserJob < AnalyticsJob
    action "track"

    def payload(params)
      {
        user_id: params['user']['id'],
        event: params['event']
      }
    end
  end
end
