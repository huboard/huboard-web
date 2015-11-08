module Analytics
  class IdentifyUserJob < AnalyticsJob

    def payload(params)
      {
        user_id: params['customer']['id'],
        traits: {
          email: params['email']
        }
      }
    end
  end
end
