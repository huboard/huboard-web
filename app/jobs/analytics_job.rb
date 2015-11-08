class AnalyticsJob < ActiveJob::Base
  def perform(params)
    payload = payload(params)
    Analytics::Core.identify(payload)
  end
end
