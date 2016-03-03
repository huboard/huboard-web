module Saas
  class ErrorsUnauthenticatedExpiredJob < ActiveJob::Base

    def perform(params)
      owner = params['action_controller.params']['user']
      params['url'] = "/settings/#{owner}/expired"
      Analytics::PageJob.perform_later(params)
    end
  end
end
