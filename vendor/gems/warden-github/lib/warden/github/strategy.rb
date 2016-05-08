module Warden
  module GitHub
    class Strategy < ::Warden::Strategies::Base
      SESSION_KEY = 'warden.github.oauth'

      # The first time this is called, the flow gets set up, stored in the
      # session and the user gets redirected to GitHub to perform the login.
      #
      # When this is called a second time, the flow gets evaluated, the code
      # gets exchanged for a token, and the user gets loaded and passed to
      # warden.
      #
      # If anything goes wrong, the flow is aborted and reset, and warden gets
      # notified about the failure.
      #
      # Once the user gets set, warden invokes the after_authentication callback
      # that handles the redirect to the originally requested url and cleans up
      # the flow. Note that this is done in a hook because setting a user
      # (through #success!) and redirecting (through #redirect!) inside the
      # #authenticate! method are mutual exclusive.
      def authenticate!
        if in_flow?
          continue_flow!
        else
          begin_flow!
        end
      end

      def in_flow?
        !custom_session.empty? &&
          params['state'] &&
          (params['code'] || params['error'])
      end

      # This is called by the after_authentication hook which is invoked after
      # invoking #success!.
      def finalize_flow!
        redirect!(custom_session['return_to'])
        teardown_flow
        throw(:warden)
      end

      private

      def begin_flow!
        custom_session['state'] = state
        custom_session['return_to'] = request.url
        redirect!(oauth.authorize_uri.to_s)
        throw(:warden)
      end

      def continue_flow!
        validate_flow!
        success!(load_user)
      end

      def abort_flow!(message)
        teardown_flow
        fail!(message)
        throw(:warden)
      end

      def teardown_flow
        session.delete(SESSION_KEY)
      end

      def validate_flow!
        if params['state'] != state
          abort_flow!('State mismatch')
        elsif (error = params['error']) && !error.empty?
          abort_flow!(error.gsub(/_/, ' '))
        end

        if params['browser_session_id']
          custom_session['browser_session_id'] = params['browser_session_id']
        end
      end

      def custom_session
        session[SESSION_KEY] ||= {}
      end

      def load_user
        access_token = oauth.access_token
        User.load(access_token['access_token'], access_token['scope'], custom_session['browser_session_id'])
      rescue OAuth::BadVerificationCode => e
        abort_flow!(e.message)
      end

      def state
        @state ||= custom_session['state'] || SecureRandom.hex(20)
      end

      def oauth
        @oauth ||= OAuth.new(
          config.to_hash.merge(:code => params['code'], :state => state))
      end

      def config
        @config ||= ::Warden::GitHub::Config.new(env, scope)
      end
    end
  end
end

Warden::Strategies.add(:github, Warden::GitHub::Strategy)
