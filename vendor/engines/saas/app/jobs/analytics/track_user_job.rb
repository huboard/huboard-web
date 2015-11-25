module Analytics
  class TrackUserJob < AnalyticsJob
    action "track"

    def payload(params)
      {
        user_id: params['current_user']['id'],
        event: params['event'],
        properties: params['account']
      }
    end
  end
end
