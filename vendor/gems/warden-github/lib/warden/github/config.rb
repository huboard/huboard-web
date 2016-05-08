require 'uri'

module Warden
  module GitHub
    # This class encapsulates the configuration of the strategy. A strategy can
    # be configured through Warden::Manager by defining a scope's default. Thus,
    # it is possible to use the same strategy with different configurations by
    # using multiple scopes.
    #
    # To configure a scope, use #scope_defaults inside the Warden::Manager
    # config block. The first arg is the name of the scope (the default is
    # :default, so use that to configure the default scope), the second arg is
    # an options hash which should contain:
    #
    #   - :strategies : An array of strategies to use for this scope. Since this
    #                   strategy is called :github, include it in the array.
    #
    #   - :config :     A hash containing the configs that are used for OAuth.
    #                   Valid parameters include :client_id, :client_secret,
    #                   :scope, :redirect_uri. Please refer to the OAuth
    #                   documentation of the GitHub API for the meaning of these
    #                   parameters.
    #
    #                   If :client_id or :client_secret are not specified, they
    #                   will be fetched from ENV['GITHUB_CLIENT_ID'] and
    #                   ENV['GITHUB_CLIENT_SECRET'], respectively.
    #
    #                   :scope defaults to nil.
    #
    #                   If no :redirect_uri is specified, the current path will
    #                   be used. If a path is specified it will be appended to
    #                   the request host, forming a valid URL.
    #
    # Examples
    #
    #   use Warden::Manager do |config|
    #     config.failure_app = BadAuthentication
    #
    #     # The following line doesn't specify any custom configurations, thus
    #     # the default scope will be using the implict client_id,
    #     # client_secret, and redirect_uri.
    #     config.default_strategies :github
    #
    #     # This configures an additional scope that uses the github strategy
    #     # with custom configuration.
    #     config.scope_defaults :admin, :config => { :client_id => 'foobar',
    #                                                :client_secret => 'barfoo',
    #                                                :scope => 'user,repo',
    #                                                :redirect_uri => '/admin/oauth/callback' }
    #   end
    class Config
      BadConfig = Class.new(StandardError)

      include ::Warden::Mixins::Common

      attr_reader :env, :warden_scope

      def initialize(env, warden_scope)
        @env = env
        @warden_scope = warden_scope
      end

      def client_id
        custom_config[:client_id] ||
          deprecated_config(:github_client_id) ||
          ENV['GITHUB_CLIENT_ID'] ||
          fail(BadConfig, 'Missing client_id configuration.')
      end

      def client_secret
        custom_config[:client_secret] ||
          deprecated_config(:github_secret) ||
          ENV['GITHUB_CLIENT_SECRET'] ||
          fail(BadConfig, 'Missing client_secret configuration.')
      end

      def redirect_uri
        uri_or_path =
          custom_config[:redirect_uri] ||
          deprecated_config(:github_callback_url) ||
          request.path

        normalized_uri(uri_or_path).to_s
      end

      def scope
        custom_config[:scope] || deprecated_config(:github_scopes)
      end

      def to_hash
        { :client_id     => client_id,
          :client_secret => client_secret,
          :redirect_uri  => redirect_uri,
          :scope         => scope }
      end

      private

      def custom_config
        @custom_config ||=
          env['warden'].
            config[:scope_defaults].
            fetch(warden_scope, {}).
            fetch(:config, {})
      end

      def deprecated_config(name)
        env['warden'].config[name].tap do |config|
          unless config.nil?
            warn "[warden-github] Deprecated configuration #{name} used. Please refer to the README for updated configuration instructions."
          end
        end
      end

      def normalized_uri(uri_or_path)
        uri = URI(request.url)
        uri.path = extract_path(URI(uri_or_path))
        uri.query = nil
        uri.fragment = nil

        correct_scheme(uri)
      end

      def extract_path(uri)
        path = uri.path

        if path.start_with?('/')
          path
        else
          "/#{path}"
        end
      end

      def https_forwarded_proto?
        env['HTTP_X_FORWARDED_PROTO'] &&
          env['HTTP_X_FORWARDED_PROTO'].split(',')[0] == "https"
      end

      def correct_scheme(uri)
        if uri.scheme != 'https' && https_forwarded_proto?
          uri.scheme = 'https'
          # Reparsing will use a different URI subclass, namely URI::HTTPS which
          # knows the default port for https and strips it if present.
          uri = URI(uri.to_s)
        end
        uri.port = nil if uri.port == 80

        URI(uri.to_s)
      end
    end
  end
end
