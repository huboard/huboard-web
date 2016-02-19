module Saas
  class UnauthenticatedCanceledJob < ActiveJob::Base

    def perform(params)
      user = params['current_user']['login']
      params['url'] = "/settings/#{user}/canceled"
      Analytics::PageJob.perform_later(params)
    end
  end
end
