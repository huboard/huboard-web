require 'bridge/huboard'
module ApplicationHelper
  def logged_in?
    github_authenticated?(:private) || github_authenticated?(:default)
  end
  def current_user
    github_user(:private) || github_user(:default) || OpenStruct.new
  end
  def controller? *controller
    (controller.include?(params[:controller]) || controller.include?(params[:action])) ? "nav__btn--active nav__item--current": ''
  end
  def user_token
    current_user ? current_user.token : nil
  end
  def github_config
    {
      client_id: ENV['GITHUB_CLIENT_ID'],
      client_secret: ENV['GITHUB_SECRET'],
    }
  end
  def huboard(token = nil)
    Huboard::Client.new(token || user_token, github_config)
  end
  def gh
    huboard.connection
  end
  def emojis
    @emojis ||= gh.connection.get('./emojis').body
  end
  def couch
    @_couch ||= HuBoard::Couch.new :base_url => ENV["COUCH_URL"], :database => ENV["COUCH_DATABASE"]
  end

  # Initiates the OAuth flow if not already authenticated for the
  #         # specified scope.
  def github_authenticate!(scope=:default)
    request.env['warden'].authenticate!(scope: scope)
  end

  # Logs out a user if currently logged in for the specified scope.
  def github_logout(scope=:default)
    request.env['warden'].logout(scope)
  end
  def github_authenticated?(scope=:default)
    request.env['warden'].authenticated?(scope)
  end

  def github_user(scope=:default)
    request.env['warden'].user(scope)
  end
  def github_session(scope=:default)
    request.env['warden'].session(scope)  if github_authenticated?(scope)
  end
  def is_collaborator?(repo)
    repo['permissions'] && repo['permissions']['push'] && logged_in?
  end
  def authorization_level
    return :all if !logged_in?
    is_admin?(params[:user], params[:repo]) ? :admin : :collaborator
  end
  def is_admin?(user, repo)
    permissions = gh.repos(user, repo)['permissions']
    return permissions && permissions['admin']
  end
  def markdown(text)
   Redcarpet::Markdown.new(Redcarpet::Render::Safe).render(text).html_safe
  end
  def generate_issue_event(action, message)
    verb = action.present_tense
    constant = "Api::Issues#{verb.capitalize}IssueJob".constantize

    if Rails.configuration.active_job.queue_adapter == :sucker_punch # sucker_punch doesn't support enqueue
      constant.perform_later message
    else
      constant.set(wait: 1.second).perform_later message
    end
  end
end
