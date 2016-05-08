# warden-github

A [warden](https://github.com/hassox/warden) strategy that provides OAuth authentication to GitHub.

## The Extension in Action

To play with the extension, follow these steps:

1.  Check out a copy of the source.
2.  [Create an application on GitHub](https://github.com/settings/applications/new) and set the callback URL to `http://localhost:9292`
3.  Run the following command with the client id and client secret obtained from the previous step:

        GITHUB_CLIENT_ID="<from GH>" GITHUB_CLIENT_SECRET="<from GH>" bundle exec rackup

    This will run the example app [example/simple_app.rb](example/simple_app.rb).

    If you wish to see multiple user scopes in action, run the above command with an additional variable:

        MULTI_SCOPE_APP=1 GITHUB_CLIENT_ID="<from GH>" GITHUB_CLIENT_SECRET="<from GH>" bundle exec rackup

    This will run the example app [example/multi_scope_app.rb](example/multi_scope_app.rb).

4.  Point your browser at [http://localhost:9292/](http://localhost:9292) and enjoy!

## Configuration

In order to use this strategy, simply tell warden about it.
This is done by using `Warden::Manager` as a rack middleware and passing a config block to it.
Read more about warden setup at the [warden wiki](https://github.com/hassox/warden/wiki/Setup).

For simple usage without customization, simply specify it as the default strategy.

```ruby
use Warden::Manager do |config|
  config.failure_app = BadAuthentication
  config.default_strategies :github
end
```

In order to pass custom configurations, you need to configure a warden scope.
Note that the default warden scope (i.e. when not specifying any explicit scope) is `:default`.

Here's an example that specifies configs for the default scope and a custom admin scope.
Using multiple scopes allows you to have different user types.

```ruby
use Warden::Manager do |config|
  config.failure_app = BadAuthentication
  config.default_strategies :github

  config.scope_defaults :default, :config => { :scope => 'user:email' }
  config.scope_defaults :admin, :config => { :client_id     => 'foobar',
                                             :client_secret => 'barfoo',
                                             :scope         => 'user,repo',
                                             :redirect_uri  => '/admin/oauth/callback' }

  config.serialize_from_session { |key| Warden::GitHub::Verifier.load(key) }
  config.serialize_into_session { |user| Warden::GitHub::Verifier.dump(user) }
end
```

The two serialization methods store the API token in the session securely via the `WARDEN_GITHUB_VERIFIER_SECRET` environmental variable.

### Parameters

The config parameters and their defaults are listed below.
Please refer to the [GitHub OAuth documentation](http://developer.github.com/v3/oauth/) for an explanation of their meaning.

- **client_id:** Defaults to `ENV['GITHUB_CLIENT_ID']` and raises if not present.
- **client_secret:** Defaults to `ENV['GITHUB_CLIENT_SECRET']` and raises if not present.
- **scope:** Defaults to `nil`.
- **redirect_uri:** Defaults to the current path.
  Note that paths will be expanded to a valid URL using the request url's host.

### Using with GitHub Enterprise

GitHub API communication is done entirely through the [octokit gem](https://github.com/pengwynn/octokit).
For the OAuth process (which uses another endpoint than the API), the web endpoint is read from octokit.
In order to configure octokit for GitHub Enterprise you can either define the two environment variables `OCTOKIT_API_ENDPOINT` and `OCTOKIT_WEB_ENDPOINT`, or configure the `Octokit` module as specified in their [README](https://github.com/pengwynn/octokit#using-with-github-enterprise).

### JSON Dependency

This gem and its dependencies do not explicitly depend on any JSON library.
If you're on ruby 1.8.7 you'll have to include one explicitly.
ruby 1.9 comes with a json library that will be used if no other is specified.

## Usage

Some warden methods that you will need:

```ruby
env['warden'].authenticate!                   # => Uses the configs from the default scope.
env['warden'].authenticate!(:scope => :admin) # => Uses the configs from the admin scope.

# Analogous to previous lines, but does not halt if authentication does not succeed.
env['warden'].authenticate
env['warden'].authenticate(:scope => :admin)

env['warden'].authenticated?         # => Checks whether the default scope is logged in.
env['warden'].authenticated?(:admin) # => Checks whether the admin scope is logged in.

env['warden'].user         # => The user for the default scope.
env['warden'].user(:admin) # => The user for the admin scope.

env['warden'].session         # => Namespaced session accessor for the default scope.
env['warden'].session(:admin) # => Namespaced session accessor for the admin scope.

env['warden'].logout           # => Logs out all scopes.
env['warden'].logout(:default) # => Logs out the default scope.
env['warden'].logout(:admin)   # => Logs out the admin scope.
```

For further documentation, refer to the [warden wiki](https://github.com/hassox/warden/wiki).

The user object (`Warden::GitHub::User`) responds to the following methods:

```ruby
user = env['warden'].user

user.id          # => The GitHub user id.
user.login       # => The GitHub username.
user.name
user.gravatar_id # => The md5 email hash to construct a gravatar image.
user.avatar_url
user.email       # => Requires user:email or user scope.
user.company

# These require user scope.
user.organization_member?('rails')         # => Checks 'rails' organization membership.
user.organization_public_member?('github') # => Checks publicly disclosed 'github' organization membership.
user.team_member?(1234)                    # => Checks membership in team with id 1234.

# API access
user.api # => Authenticated Octokit::Client for the user.
```

For more information on API access, refer to the [octokit documentation](http://rdoc.info/gems/octokit).

## Framework Adapters

If you're looking for an easy way to integrate this into a Sinatra or Rails application, take a look at the following gems:

- [sinatra_auth_github](https://github.com/atmos/sinatra_auth_github)
- [warden-github-rails](https://github.com/fphilipe/warden-github-rails)

## Single Sign Out

OAuth applications owned by the GitHub organization are sent an extra browser parameter to ensure that the user remains logged in to github.com. Taking advantage of this is provided by a small module you include into your controller and a before filter. Your `ApplicationController` should resemble something like this.


```ruby
class ApplicationController < ActionController::Base
  include Warden::GitHub::SSO

  protect_from_forgery with: :exception

  before_filter :verify_logged_in_user

  private

  def verify_logged_in_user
    unless github_user && warden_github_sso_session_valid?(github_user, 120)
      request.env['warden'].logout
      request.env['warden'].authenticate!
    end
  end
end
```

You can also see single sign out in action in the example app.

## Additional Information

- [warden](https://github.com/hassox/warden)
- [octokit](https://github.com/pengwynn/octokit)
- [GitHub OAuth Busy Developer's Guide](https://gist.github.com/technoweenie/419219)
- [GitHub API documentation](http://developer.github.com)
- [List of GitHub OAuth scopes](http://developer.github.com/v3/oauth/#scopes)
- [Register a new OAuth application on GitHub](https://github.com/settings/applications/new)

