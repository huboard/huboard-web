class IssueEventJob < ActiveJob::Base
  # TODO: DRY this up relative to MilestoneEventJob

  class_attribute :_action
  class_attribute :_cache_key
  class_attribute :_timestamp
  class_attribute :_identifier

  def self.action(action)
    self._action = action
  end

  self._timestamp = Proc.new { Time.now.utc.iso8601 }

  def self.timestamp(override)
    self._timestamp = override
  end

  self._identifier = ->(p){ p['issue']['number'] }

  def self.identifier(override=nil)
    self._identifier = override
  end


  self._cache_key = ->(message) { "#{message[:meta][:action]}.#{message[:meta][:user]["login"]}.#{message[:meta][:identifier]}.#{message[:meta][:timestamp]}" }
  
  def self.cache_key(override)
    self._cache_key = override
  end

  def self.build_meta(params)
    #TODO Fix this hack on remapping params to HWIA
    params = HashWithIndifferentAccess.new(params)
    issue = HashWithIndifferentAccess.new(params['issue'])
    action = self._action.is_a?(String) ? self._action : self._action.call(params)

    HashWithIndifferentAccess.new(
      action: action,
      timestamp: self._timestamp.call(params),
      correlationId: params['action_controller.params']['correlationId'],
      user: params['current_user'],
      identifier: self._identifier.call(params),
      repo_full_name: "#{issue[:repo][:owner][:login]}/#{issue[:repo][:name]}"
    )
  end

  def build_message(params)
    payload = payload(params)
    payload['actor'] = self.arguments.first['current_user']

    message = HashWithIndifferentAccess.new({
      meta: self.class.build_meta(arguments.first),
      payload: payload
    })
  end

  def perform(params)
    message = build_message(params)
    message[:cache_key] = self._cache_key.call(message)
    Rails.logger.debug [self.class, 'ActiveJob:cache_key', message[:cache_key]]

    message[:webhook_publishable] = self.class.included_modules.include? IsPublishable
    CachedJob.perform_later(message)
  end
end
