require "ember-cli-rails"
namespace "heroku-ember-cli" do
  task compile: :environment do
    `echo STRIPE_PUBLISHABLE_API=$STRIPE_PUBLISHABLE_API > #{Rails.root.join('.env')}`
    EmberCLI.configure do |c|
      c.app :app, path: Rails.root.join('ember-app')
      c.app :accounts, path: Rails.root.join('ember-accounts')
    end

    EmberCLI.install_dependencies!
    app = EmberCLI.get_app "app"
    Dir.chdir 'ember-app' do
      `echo ===============================================`
      `#{app.ember_path} build --environment production`
      `echo ===============================================`
    end
    
    app = EmberCLI.get_app "accounts"
    Dir.chdir 'ember-accounts' do
      `echo ===============================================`
      `#{app.ember_path} build --environment production`
      `echo ===============================================`
    end
  end
end

task "assets:precompile" => "heroku-ember-cli:compile"
