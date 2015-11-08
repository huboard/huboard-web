module Saas
  class ChargesCreateJob < ActiveJob::Base

    def perform(params)
      Analytics::IdentifyUserJob.perform_later(params)
    end

  end
end
