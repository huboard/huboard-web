module Saas
  class ErrorsUnauthenticatedExpiredJob < ActiveJob::Base

    def perform(params)
      user = params['current_user']['login']
      params['url'] = "/settings/#{user}/unauthenticated"
      Analytics::PageJob.perform_later(params)
    end
  end
end
