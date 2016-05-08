require File.expand_path('../boot', __FILE__)

require "action_controller/railtie"
require "action_mailer/railtie"
require "sprockets/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

require File.expand_path('../../lib/core_extensions/string', __FILE__)
require File.expand_path('../../lib/hu_board/middleware', __FILE__)

Octokit.api_endpoint = ENV["GITHUB_API_ENDPOINT"] if ENV["GITHUB_API_ENDPOINT"]
Octokit.web_endpoint = ENV["GITHUB_WEB_ENDPOINT"] if ENV["GITHUB_WEB_ENDPOINT"]

Dotenv::Railtie.load

if ENV["HUBOARD_ENV"] == 'production'
  require 'saas'
  require 'stripe-rails'
end

module HuboardWeb
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    if ENV["HUBOARD_ENV"] == 'production'
      config.railties_order = [Saas::Engine, :all]
    end

    # Do not swallow errors in after_commit/after_rollback callbacks.
    #config.active_record.raise_in_transactional_callbacks = true
    config.autoload_paths << Rails.root.join('lib')

    # Configure dalli to use a connection pool
    config.cache_store = :dalli_store, nil, { :pool_size => 5 }

    if ENV["SELF_HOST_FAYE"] && ENV['SOCKET_BACKEND'] == '/site/pubsub'
      #config.middleware.delete Rack::Lock
      Faye.logger = Logger.new(STDOUT)
      config.middleware.use Faye::RackAdapter, 
        mount: (ENV['SOCKET_BACKEND']), 
        timeout: 25,
        ping: 20,
        extensions: [PrivatePub::FayeExtension.new],
        engine: {
          type: Faye::Redis,
          uri: (ENV['REDIS_URL'] || 'redis://localhost:6379')
        }
    elsif !ENV['SELF_HOST_FAYE'] && ENV['HUBOARD_ENV'] == "production"
      config.middleware.use Faye::RackAdapter, 
        mount:"/site/pubsub", 
        timeout: 25,
        ping: 20,
        extensions: [FayeExtensions::Disconnect.new]
    end

    Faraday::Response::RaiseGheeError.const_get("ERROR_MAP").each do |status, exception|
      config.action_dispatch.rescue_responses[exception.to_s] = status
    end

    config.action_dispatch.rescue_responses["HuBoard::Error"] = 422

    config.exceptions_app = self.routes

    if ENV['SIDEKIQ']
      config.active_job.queue_adapter = :sidekiq
    else
      config.active_job.queue_adapter = :sucker_punch
    end
    
    config.middleware.use PDFKit::Middleware, {print_media_type: true}, only: %r[^/settings]
    config.middleware.use HuBoard::Middleware::Session
    
    # !!! This addresses a Rails Behaviour that coaxes empty arrays in the params hash into nils 
    # see https://github.com/rails/rails/pull/13188
    # Ricki Mar 17 2015
    config.action_dispatch.perform_deep_munge = false
  end
end
