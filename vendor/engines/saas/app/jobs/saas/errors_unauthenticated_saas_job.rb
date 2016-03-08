module Saas
  class ErrorsUnauthenticatedSaasJob < ActiveJob::Base

    def perform(params)
      owner = params['action_controller.params']['user']
      params['url'] = "/settings/#{owner}/unauthenticated"
      Analytics::PageJob.perform_later(params)
    end
  end
end
