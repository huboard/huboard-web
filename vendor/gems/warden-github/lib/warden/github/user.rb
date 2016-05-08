module Warden
  module GitHub
    class User < Struct.new(:attribs, :token, :scope, :browser_session_id, :memberships)
      ATTRIBUTES = %w[id login name gravatar_id avatar_url email company site_admin].freeze

      def self.load(access_token, scope, browser_session_id = nil)
        api  = Octokit::Client.new(:access_token => access_token)
        data =  { }

        api.user.to_hash.each do |k,v|
          data[k.to_s] = v if ATTRIBUTES.include?(k.to_s)
        end

        new(data, access_token, scope, browser_session_id)
      end

      def marshal_dump
        Hash[members.zip(values)]
      end

      def marshal_load(hash)
        hash.each { |k,v| send("#{k}=", v) }
      end

      ATTRIBUTES.each do |name|
        define_method(name) { attribs[name] }
      end

      # See if the user is a public member of the named organization
      #
      # name - the organization name
      #
      # Returns: true if the user is publicized as an org member
      def organization_public_member?(org_name)
        membership_cache.fetch_membership(:org_pub, org_name) do
          api.organization_public_member?(org_name, login)
        end
      end

      # Backwards compatibility:
      alias_method :publicized_organization_member?, :organization_public_member?

      # See if the user is a member of the named organization
      #
      # name - the organization name
      #
      # Returns: true if the user has access, false otherwise
      def organization_member?(org_name)
        membership_cache.fetch_membership(:org, org_name) do
          api.organization_member?(org_name, login)
        end
      end

      # See if the user is a member of the team id
      #
      # team_id - the team's id
      #
      # Returns: true if the user has access, false otherwise
      def team_member?(team_id)
        membership_cache.fetch_membership(:team, team_id) do
          api.team_member?(team_id, login)
        end
      end

      # Identify GitHub employees/staff members.
      #
      # Returns: true if the authenticated user is a GitHub employee, false otherwise
      def site_admin?
        !!site_admin
      end

      # Identify if the browser session is still valid
      #
      # Returns: true if the browser session is still active or the GitHub API is unavailable
      def browser_session_valid?(since = 120)
        return true unless using_single_sign_out?
        client = api
        client.get("/user/sessions/active", :browser_session_id => browser_session_id)
        client.last_response.status == 204
      rescue Octokit::ServerError # GitHub API unavailable
        true
      rescue Octokit::ClientError => e # GitHub API failed
        false
      end

      # Identify if the user is on a GitHub SSO property
      #
      # Returns: true if a browser_session_id is present, false otherwise.
      def using_single_sign_out?
        !(browser_session_id.nil? || browser_session_id == "")
      end

      # Access the GitHub API from Octokit
      #
      # Octokit is a robust client library for the GitHub API
      # https://github.com/octokit/octokit.rb
      #
      # Returns a cached client object for easy use
      def api
        # Don't cache instance for now because of a ruby marshaling bug present
        # in MRI 1.9.3 (Bug #7627) that causes instance variables to be
        # marshaled even when explicitly specifying #marshal_dump.
        Octokit::Client.new(:login => login, :access_token => token)
      end

      private

      def membership_cache
        self.memberships ||= {}
        @membership_cache ||= MembershipCache.new(memberships)
      end
    end
  end
end
