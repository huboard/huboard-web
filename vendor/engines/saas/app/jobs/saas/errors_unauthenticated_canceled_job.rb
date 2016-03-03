module Saas
  class ErrorsUnauthenticatedCanceledJob < ActiveJob::Base

    def perform(params)
      owner = params['action_controller.params']['user']
      params['url'] = "/settings/#{owner}/canceled"
      Analytics::PageJob.perform_later(params)
    end
  end
end
