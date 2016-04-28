class IssueEventJob < ActiveJob::Base

  around_perform :guard_against_double_events

  def self.action(action)
    @_action = action
  end

  @_timestamp = Proc.new { Time.now.utc.iso8601 }
  def self.timestamp(override=nil)
    if override
      @_timestamp = override
    else
      @_timestamp
    end
  end
  def self.identifier(override=nil)
    @_identifier = override
  end

  class_attribute :_cache_key

  self._cache_key = ->(payload) { "#{payload[:meta][:action]}.#{payload[:meta][:user]["login"]}.#{payload[:meta][:identifier]}.#{payload[:meta][:timestamp]}" }
  def self.cache_key(override)
    self._cache_key = override
  end

  def self.build_meta(params)
    #TODO Fix this hack on remapping params to HWIA
    params = HashWithIndifferentAccess.new(params)
    issue = HashWithIndifferentAccess.new(params['issue'])
    action = @_action.is_a?(String) ? @_action : @_action.call(params)
    HashWithIndifferentAccess.new(
      action: action,
      timestamp: (@_timestamp || Proc.new{Time.now.utc.iso8601}).call(params),
      correlationId: params['action_controller.params']['correlationId'],
      user: params['current_user'],
      identifier: (@_identifier || ->(p){ p['issue']['number']}).call(params),
      repo_full_name: "#{issue[:repo][:owner][:login]}/#{issue[:repo][:name]}"
    )
  end

  def guard_against_double_events
    message = build_message(self.arguments.first)
    willPublish = true

    Rails.cache.with do |dalli|
      key = self._cache_key.call(message)
      willPublish = false if dalli.get(key)
      Rails.logger.debug [self.class, 'ActiveJob:cache_key', key, 'willPublish', willPublish]
      dalli.set(key, key)
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
