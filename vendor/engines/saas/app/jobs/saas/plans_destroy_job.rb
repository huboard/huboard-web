module Saas
  class PlansDestroyJob < ActiveJob::Base

    def perform(params)
      if params[:event] == 'plan_canceled'
        params['url'] = "/settings/#{params[:repo_owner]}/canceled"
        Analytics::PageJob.perform_later(params)
      end
    end
  end
end
