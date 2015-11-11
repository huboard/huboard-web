module Analytics
  class TrackUserJob < AnalyticsJob
    action "track"

    def payload(params)
      {
        user_id: params['user_id'],
        event: params['event'],
        properties: params['data']
      }
    end
  end
end
