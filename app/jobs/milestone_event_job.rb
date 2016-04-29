class MilestoneEventJob < ActiveJob::Base

  around_perform :guard_against_double_events

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

  self._identifier = ->(p){ p['milestone']['number'] }

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
    milestone = HashWithIndifferentAccess.new(params['milestone'])
    action = self._action.is_a?(String) ? self._action : self._action.call(params)
    HashWithIndifferentAccess.new(
      action: action,
      timestamp: self._timestamp.call(params),
      correlationId: params['action_controller.params']['correlationId'],
      user: params['current_user'],
      identifier: self._identifier.call(params),
      repo_full_name: "#{milestone[:repo][:owner][:login]}/#{milestone[:repo][:name]}"
    )
  end

  def guard_against_double_events
    message = build_message(self.arguments.first)
    willPublish = true

    Rails.cache.with do |dalli|
      key = self._cache_key.call(message)
      willPublish = false if dalli.get(key)
      Rails.logger.debug [self.class, 'ActiveJob:cache_key', key, 'willPublish', willPublish]
      dalli.set(key, "")
    end

    yield if willPublish
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
    message = deliver build_message(params)

    return if params[:suppress]

    PublishWebhookJob.perform_later message if self.class.included_modules.include? IsPublishable
  end

  def deliver(message)
    client = ::Faye::Redis::Publisher.new({})
    Rails.logger.debug ["/" + message[:meta][:repo_full_name], message]
    channel = message[:meta][:repo_full_name].downcase
    client.publish "/" + channel, message
    return message
  end
end
