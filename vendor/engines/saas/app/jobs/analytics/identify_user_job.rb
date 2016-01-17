module Analytics
  class IdentifyUserJob < AnalyticsJob
    action "identify"

    def payload(params)
      {
        user_id: params['current_user']['id'] || "Anonymous",
        traits: params['data']
      }
    end
  end
end
