module Analytics
  class IdentifyUserJob < AnalyticsJob

    def payload(params)
      {
        user_id: params['owner']['id'],
        traits: {
          email: params['email'] || "",
          user: params['user'],
          account: params['account_id'] || ""
        }
      }
    end
  end
end
