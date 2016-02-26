
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

module Warden
  module GitHub
    class Config
      alias_method :base_normalized_uri, :normalized_uri

      def normalized_uri(uri_or_path)
        uri = base_normalized_uri(uri_or_path)
        puts "Warden Override: #{uri}"
        uri
      end
    end
  end
end
