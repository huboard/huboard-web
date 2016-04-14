module Analytics
  class IdentifyUserJob < AnalyticsJob
    action "identify"

    def payload(params)
      {
        user_id: params['current_user']['id'] || "Anonymous",
        anonymous_id: params['session_id'],
        traits: params['data']
      }
    end
  end
end
