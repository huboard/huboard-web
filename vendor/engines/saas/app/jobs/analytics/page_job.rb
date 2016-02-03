module Analytics
  class PageJob < AnalyticsJob
    action "page"

    def payload(params)
      {
        user_id: params['current_user']['id'] || "Anonymous",
        name: params['url'],
        properties: { url: params['url'] }
      }
    end
  end
end
