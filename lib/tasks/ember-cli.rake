require "ember-cli-rails"
namespace "heroku-ember-cli" do
  task compile: :environment do
    EmberCLI.configure do |c|
      c.app :app, path: Rails.root.join('ember-app')
      c.app :accounts, path: Rails.root.join('ember-accounts') if ENV['HUBOARD_ENV'] == 'production'
    end

    EmberCLI.install_dependencies!
    app = EmberCLI.get_app "app"
    Dir.chdir 'ember-app' do
      `#{app.ember_path} build --environment production`
    end
    
    if ENV['HUBOARD_ENV'] == 'production'
      app = EmberCLI.get_app "accounts"
      Dir.chdir 'ember-accounts' do
        `#{app.ember_path} build --environment production`
      end
    end
  end
end

task "assets:precompile" => "heroku-ember-cli:compile"
