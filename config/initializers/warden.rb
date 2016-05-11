
Rails.application.middleware.insert_after ActionDispatch::Flash, Warden::Manager do |config|
  config.scope_defaults :default, strategies: [:github],
    config: {
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    redirect_uri: '/oauth/github/callback'
  }
  config.scope_defaults :private, strategies: [:github],
    config: {
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'read:org,repo,user:email',
    redirect_uri: '/oauth/github/callback'
  }

  config.scope_defaults :public, strategies: [:github],
    config: {
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'read:org,public_repo,user:email',
    redirect_uri: '/oauth/github/callback'
  }

  config.failure_app = Rails.application.routes

end


Warden::Manager.serialize_from_session do |key| 
  Rails.logger.debug ["Warden::Manager.serialize_from_session", key]
  user = Warden::GitHub::Verifier.load(key) 
  Rails.logger.debug ["Warden::Manager.serialize_from_session", user]
  user
end

Warden::Manager.serialize_into_session do |user| 
  Rails.logger.debug ["Warden::Manager.serialize_into_session", user]
  Warden::GitHub::Verifier.dump(user) 
end

require 'uri'

module Warden
  module GitHub
    class Config
      alias_method :base_normalized_uri, :normalized_uri

      def normalized_uri(uri_or_path)
        uri = base_normalized_uri(uri_or_path)

        app_name = ENV["HEROKU_APP_NAME"]
        parent_app_name = ENV["HEROKU_PARENT_APP_NAME"]
        Rails.logger.info "Warden Override: #{app_name} => #{parent_app_name}"
        if parent_app_name && parent_app_name != app_name
          uri.host.sub! app_name, parent_app_name
          uri.query = URI.encode_www_form("APP_NAME" => app_name)
        end

        Rails.logger.info "Warden Override: #{uri}"
        uri
      end
    end
  end
end

class Huboard
  class Warden
    class AppRedirect
      def initialize(app, params={})
        @app = app
        @params = params
      end

      def call(env)
        uri = Addressable::URI.parse(env['REQUEST_URI'])

        app_name = uri.query_values['APP_NAME'] if uri.query_values
        parent_app_name = ENV['HEROKU_APP_NAME']
        Rails.logger.info "AppRedirect: #{parent_app_name} => #{app_name}" if app_name

        if app_name && parent_app_name
          uri.query_values = uri.query_values(Array).reject { |kvp| kvp[0] == 'APP_NAME' } unless !uri.query_values

          app_redirect = "#{env['rack.url_scheme']}://#{env['HTTP_HOST'].sub(parent_app_name, app_name)}#{uri}"
          Rails.logger.info "AppRedirect to #{app_redirect}"
          return [302, {"Location" => app_redirect}, self]
        end

        @app.call env
      end
    end
  end
end

Rails.application.middleware.insert_before Warden::Manager, Huboard::Warden::AppRedirect
