class BoardIndexJob < ActiveJob::Base

  def perform(params)
    Analytics::IdentifyUserJob.perform_later(params)
  end
end
