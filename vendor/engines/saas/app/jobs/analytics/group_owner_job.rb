module Analytics
  class GroupOwnerJob < AnalyticsJob
    action "group"

    def payload(params)
      traits  = {
        plan: params['repo_owner']['type'],
        monthly_spend: params['repo_owner']['type'] == "User" ? 7 : 24,
        name: params['repo_owner']['name'] || params['repo_owner']['login'],
        login: params['repo_owner']['login']
      }
      {
        user_id: params['current_user']['id'] || "Anonymous",
        group_id: params['repo_owner']['id'],
        traits: traits
      }
    end
  end
end

