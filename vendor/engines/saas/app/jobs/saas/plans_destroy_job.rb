module Saas
  class PlansDestroyJob < ActiveJob::Base

    def perform(params)
      if params[:event] == 'plan_canceling'
        params['url'] = "/settings/#{params[:repo_owner]}/canceling"
        Analytics::PageJob.perform_later(params)
      end
    end
  end
end
