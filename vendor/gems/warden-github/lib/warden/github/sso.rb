module Warden
  module GitHub
    module SSO
      def warden_github_sso_session_valid?(user, expiry_in_seconds = 30)
        return true if defined?(::Rails) && ::Rails.env.test?
        if warden_github_sso_session_needs_reverification?(user, expiry_in_seconds)
          if user.browser_session_valid?(expiry_in_seconds)
            warden_github_sso_session_reverify!
            return true
          end
          return false
        end
        true
      end

      def warden_github_sso_session_verified_at
        session[:warden_github_sso_session_verified_at] || Time.now.utc.to_i - 86400
      end

      def warden_github_sso_session_reverify!
        session[:warden_github_sso_session_verified_at] = Time.now.utc.to_i
      end

      def warden_github_sso_session_needs_reverification?(user, expiry_in_seconds)
        user.using_single_sign_out? &&
          (warden_github_sso_session_verified_at <= (Time.now.utc.to_i - expiry_in_seconds))
      end
    end
  end
end
