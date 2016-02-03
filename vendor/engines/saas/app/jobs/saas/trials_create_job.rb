module Saas
  class TrialsCreateJob < ActiveJob::Base

    def perform(params)
      user = params['current_user']['login']
      params['url'] = "/settings/#{user}/trialed"
      Analytics::PageJob.perform_later(params)
    end
  end
end
