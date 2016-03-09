module Saas
  class TrialsCreateJob < ActiveJob::Base

    def perform(params)
      owner = params['action_controller.params']['user']
      params['url'] = "/settings/#{owner}/trialing"
      Analytics::PageJob.perform_later(params)
    end
  end
end
