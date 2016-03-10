module Saas
  class ChargesCreateJob < ActiveJob::Base

    def perform(params)
      Analytics::IdentifyUserJob.perform_later(params)
      Analytics::TrackUserJob.perform_later(params)
      Analytics::GroupOwnerJob.perform_later(params)

      if params[:event]
        params['url'] = "/settings/#{params[:repo_owner]['login']}/upgrading"
        Analytics::PageJob.perform_later(params)
      end
    end
  end
end
