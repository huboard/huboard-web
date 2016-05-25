class CachedJob < ActiveJob::Base
  def perform(params)
    Rails.cache.with do |dalli|
      uuid = SecureRandom.uuid
      if params[:cache_key] && !dalli.get(params[:cache_key])
        dalli.set(params[:cache_key], uuid)
      end

      if dalli.get(params[:cache_key]) === uuid
        message = deliver params

        return if params[:suppress]
        PublishWebhookJob.perform_later message if params[:webhook_publishable]
      end
    end
  end
  
  :private

  def deliver(message)
    client = ::Faye::Redis::Publisher.new({})
    Rails.logger.debug ["/" + message[:meta][:repo_full_name], message]
    channel = message[:meta][:repo_full_name].downcase
    client.publish "/" + channel, message
    return message
  end
end
