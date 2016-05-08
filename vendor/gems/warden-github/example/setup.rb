require 'sinatra'
require 'yajl/json_gem'

module Example
  class BaseApp < Sinatra::Base
    enable  :sessions
    enable  :raise_errors
    disable :show_exceptions

    get '/debug' do
      content_type :text
      env['rack.session'].to_yaml
    end
  end

  class BadAuthentication < Sinatra::Base
    get '/unauthenticated' do
      status 403
      <<-EOS
      <h2>Unable to authenticate, sorry bud.</h2>
      <p>#{env['warden'].message}</p>
      EOS
    end
  end
end
