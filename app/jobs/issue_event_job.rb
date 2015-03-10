class IssueEventJob < ActiveJob::Base

  before_enqueue :guard_against_double_events

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

  def self.build_meta(params)
    issue = params['issue']
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
    payload = { meta:  self.class.build_meta(self.arguments.first) }
    Rails.cache.with do |dalli|
      key = "#{payload[:meta][:action]}.#{payload[:meta][:user]["login"]}.#{payload[:meta][:identifier]}.#{payload[:meta][:timestamp]}"
      return false if dalli.get(key)
      dalli.set(key, payload.to_s)
    end
  end

  def perform(params)
    message = deliver payload(params)

    PublishWebhookJob.perform_later message if self.class.included_modules.include? IsPublishable
  end

  def deliver(payload)
    message = { 
      meta: self.class.build_meta(arguments.first),
      payload: payload
    }
    client = ::Faye::Redis::Publisher.new({})
    Rails.logger.debug ["/" + message[:meta][:repo_full_name], message]
    client.publish "/" + message[:meta][:repo_full_name], message
    return message
  end
end
