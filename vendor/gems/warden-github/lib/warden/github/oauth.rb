require 'uri'
require 'net/https'

module Warden
  module GitHub
    class OAuth
      BadVerificationCode = Class.new(StandardError)

      attr_reader :code,
                  :state,
                  :scope,
                  :client_secret,
                  :client_id,
                  :redirect_uri

      def initialize(attrs={})
        @code = attrs[:code]
        @state = attrs[:state]
        @scope = attrs[:scope]
        @client_id = attrs.fetch(:client_id)
        @client_secret = attrs.fetch(:client_secret)
        @redirect_uri = attrs.fetch(:redirect_uri)
      end

      def authorize_uri
        @authorize_uri ||= build_uri(
          '/login/oauth/authorize',
          :client_id => client_id,
          :redirect_uri => redirect_uri,
          :scope => scope,
          :state => state)
      end

      def access_token
        @access_token ||= load_access_token
      end

      private

      def load_access_token
        http = Net::HTTP.new(access_token_uri.host, access_token_uri.port)
        http.use_ssl = access_token_uri.scheme == 'https'

        request = Net::HTTP::Post.new(access_token_uri.path)
        request.body = access_token_uri.query

        response = http.request(request)
        decode_params(response.body)
      rescue IndexError
        fail BadVerificationCode, 'Bad verification code'
      end

      def access_token_uri
        @access_token_uri ||= build_uri(
          '/login/oauth/access_token',
          :client_id => client_id,
          :client_secret => client_secret,
          :code => code)
      end

      def build_uri(path, params)
        URI(Octokit.web_endpoint).tap do |uri|
          uri.path = path
          uri.query = encode_params(normalize_params(params))
        end
      end

      def normalize_params(params)
        params.reject { |_,v| v.nil? || v == '' }
      end

      def encode_params(params)
        if URI.respond_to? :encode_www_form
          return URI.encode_www_form(params)
        end

        params.map { |*kv|
          kv.flatten.map { |i|
            URI.encode(i.to_s, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))
          }.join('=')
        }.join('&')
      end

      def decode_params(params)
        if URI.respond_to? :decode_www_form
          return Hash[URI.decode_www_form(params)]
        end

        Hash[
          params.split('&').map { |i|
            i.split('=').map { |i| URI.decode(i) }
          }
        ]
      end
    end
  end
end
