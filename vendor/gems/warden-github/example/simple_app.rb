require File.expand_path('../setup', __FILE__)

module Example
  class SimpleApp < BaseApp
    include Warden::GitHub::SSO

    enable :inline_templates

    GITHUB_CONFIG = {
      :client_id     => ENV['GITHUB_CLIENT_ID']     || 'test_client_id',
      :client_secret => ENV['GITHUB_CLIENT_SECRET'] || 'test_client_secret',
      :scope         => 'user'
    }

    use Warden::Manager do |config|
      config.failure_app = BadAuthentication
      config.default_strategies :github
      config.scope_defaults :default, :config => GITHUB_CONFIG
      config.serialize_from_session { |key| Warden::GitHub::Verifier.load(key) }
      config.serialize_into_session { |user| Warden::GitHub::Verifier.dump(user) }
    end

    def verify_browser_session
      if env['warden'].user && !warden_github_sso_session_valid?(env['warden'].user, 10)
        env['warden'].logout
      end
    end

    get '/' do
      erb :index
    end

    get '/profile' do
      verify_browser_session
      env['warden'].authenticate!
      erb :profile
    end

    get '/login' do
      verify_browser_session
      env['warden'].authenticate!
      redirect '/'
    end

    get '/logout' do
      env['warden'].logout
      redirect '/'
    end
  end

  def self.app
    @app ||= Rack::Builder.new do
      run SimpleApp
    end
  end
end

__END__

@@ layout
<html>
  <body>
    <h1>Simple App Example</h1>
    <ul>
      <li><a href='/'>Home</a></li>
      <li><a href='/profile'>View profile</a><% if !env['warden'].authenticated? %> (implicit sign in)<% end %></li>
    <% if env['warden'].authenticated? %>
      <li><a href='/logout'>Sign out</a></li>
    <% else %>
      <li><a href='/login'>Sign in</a> (explicit sign in)</li>
    <% end %>
    </ul>
    <hr />
    <%= yield %>
  </body>
</html>

@@ index
<% if env['warden'].authenticated? %>
  <h2>
    <img src='<%= env['warden'].user.avatar_url %>' width='50' height='50' />
    Welcome <%= env['warden'].user.name %>
  </h2>
<% else %>
  <h2>Welcome stranger</h2>
<% end %>

@@ profile
<h2>Profile</h2>
<dl>
  <dt>Rails Org Member:</dt>
  <dd><%= env['warden'].user.organization_member?('rails') %></dd>
  <dt>Publicized Rails Org Member:</dt>
  <dd><%= env['warden'].user.organization_public_member?('rails') %></dd>
  <dt>Rails Committer Team Member:</dt>
  <dd><%= env['warden'].user.team_member?(632) %></dd>
  <dt>GitHub Site Admin:</dt>
  <dd><%= env['warden'].user.site_admin? %></dd>
  <% if env['warden'].user.using_single_sign_out? %>
    <dt>GitHub Browser Session ID</dt>
    <dd><%= env['warden'].user.browser_session_id %></dd>
    <dt>GitHub Browser Session Valid</dt>
    <dd><%= warden_github_sso_session_valid?(env['warden'].user, 10) %></dd>
    <dt>GitHub Browser Session Verified At</dt>
    <dd><%= Time.at(warden_github_sso_session_verified_at) %></dd>
  <% end %>
</dl>
