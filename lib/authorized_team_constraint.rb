class AuthorizedTeamConstraint
  def matches?(request)
    logged_in = request.env['warden'].authenticated?(:private) ||
      request.env['warden'].authenticated?(:default)

    if logged_in
      user = request.env['warden'].user(:private)  || request.env['warden'].user(:default)
      connection = Huboard::Client.new(user.token).connection
      return connection.orgs.teams(ENV['GITHUB_TEAM']).members(user.login).check?
    else
      return false
    end
  end
end

