Sidekiq.configure_server do |config|
  Rails.logger = Sidekiq::Logging.logger
end
