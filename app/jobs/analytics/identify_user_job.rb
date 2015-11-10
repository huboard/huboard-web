module Analytics
  class IdentifyUserJob < AnalyticsJob
    action "identify"

    def payload(params)
      {
        user_id: params['user']['id'],
        traits: {
          email: params['email'] || params['user']['email'],
          user: params['user'],
          account: params['account_id'] || ""
        }
      }
    end
  end
end
