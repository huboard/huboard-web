module Analytics
  class IdentifyUserJob < AnalyticsJob
    action "identify"

    def payload(params)
      {
        user_id: params['user_id'],
        traits: params['data']
      }
    end
  end
end
