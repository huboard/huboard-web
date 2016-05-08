require File.expand_path('../setup', __FILE__)

module Example
  class MultiScopeApp < BaseApp
    enable :inline_templates

    GITHUB_CONFIG = {
      :client_id     => ENV['GITHUB_CLIENT_ID']     || 'test_client_id',
      :client_secret => ENV['GITHUB_CLIENT_SECRET'] || 'test_client_secret'
    }

    use Warden::Manager do |config|
      config.failure_app = BadAuthentication
      config.default_strategies :github
      config.scope_defaults :default, :config => GITHUB_CONFIG
      config.scope_defaults :admin, :config => GITHUB_CONFIG.merge(:scope => 'user,notifications')
    end

    get '/' do
      erb :index
    end

    get '/login' do
      env['warden'].authenticate!
      redirect '/'
    end

    get '/admin/login' do
      env['warden'].authenticate!(:scope => :admin)
      redirect '/'
    end

    get '/logout' do
      if params.include?('all')
        env['warden'].logout
      else
        env['warden'].logout(:default)
      end
      redirect '/'
    end

    get '/admin/logout' do
      env['warden'].logout(:admin)
      redirect '/'
    end
  end

  def self.app
    @app ||= Rack::Builder.new do
      run MultiScopeApp
    end
  end
end

__END__

@@ index
<html>
  <body>
    <h1>Multi Scope App Example</h1>
    <ul>
    <% if env['warden'].authenticated? %>
      <li><a href='/logout'>[User] sign out</a></li>
    <% else %>
      <li><a href='/login'>[User] sign in</a></li>
    <% end %>
    <% if env['warden'].authenticated?(:admin) %>
      <li><a href='/admin/logout'>[Admin] sign out</a></li>
    <% else %>
      <li><a href='/admin/login'>[Admin] sign in</a></li>
    <% end %>
    <% if env['warden'].authenticated? && env['warden'].authenticated?(:admin) %>
      <li><a href='/logout?all=1'>[User &amp; Admin] sign out</a></li>
    <% end %>
    </ul>
    <hr />
    <dl>
      <dt>User:</dt>
      <dd><%= env['warden'].authenticated? ? env['warden'].user.name : 'Not signed in' %></dd>
      <dt>Admin:</dt>
      <dd><%= env['warden'].authenticated?(:admin) ? env['warden'].user(:admin).name : 'Not signed in' %></dd>
    </dl>
  </body>
</html>
