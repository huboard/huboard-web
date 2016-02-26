
Rails.application.middleware.insert_after ActionDispatch::Flash, Warden::Manager do |config|
  config.scope_defaults :private, strategies: [:github],
    config: {
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'read:org,repo,user:email'
  }
  config.scope_defaults :default, strategies: [:github],
    config: {
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'read:org,public_repo,user:email'
  }

  config.failure_app = Rails.application.routes

end


Warden::Manager.serialize_from_session { |key| Warden::GitHub::Verifier.load(key) }
Warden::Manager.serialize_into_session { |user| Warden::GitHub::Verifier.dump(user) }

require 'uri'

module Warden
  module GitHub
    class Config
      alias_method :base_normalized_uri, :normalized_uri

      def normalized_uri(uri_or_path)
        uri = base_normalized_uri(uri_or_path)

        app_name = ENV["HEROKU_APP_NAME"]
        parent_app_name = ENV["HEROKU_PARENT_APP_NAME"]
        puts "Warden Override: #{app_name} => #{parent_app_name}"
        if parent_app_name && parent_app_name != app_name
          uri.host.sub! app_name, parent_app_name
          uri.query = URI.encode_www_form("APP_NAME" => app_name)
        end

        puts "Warden Override: #{uri}"
        uri
      end
    end
  end
end
