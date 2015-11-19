class AnalyticsJob < ActiveJob::Base
  def self.action(action)
    @action = action
  end

  def perform(params)
    payload = payload(params)

    action = self.class.instance_variable_get('@action')
    Analytics::Core.send(action, payload)
  end
end
