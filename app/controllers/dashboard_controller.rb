class DashboardController < ApplicationController
  before_action :login, only: :private
  def index
    @private = nil
    @user = gh.users(current_user.login)
    @repos = huboard.all_repos
    @auth_scope_private = github_authenticated? :private
  end
  def user
    user =   gh.users(params[:user]).raw
    not_found unless user.status == 200

    if logged_in? && current_user.login == params[:user]
      @repos = huboard.repos
    else
      @repos = huboard.repos_by_user(params[:user])
    end

    @user = user.body
    @private = nil
    render :index
  end

  def public
    user = gh.users(params[:user]).raw
    not_found unless user.status == 200
    @private = 0
    @user = user.body
    @repos = huboard.repos_by_user(params[:user]).select {|r| !r['private'] }
    @auth_scope_private = github_authenticated? :private
    render :index
  end

  def private
    user = gh.users(params[:user]).raw
    not_found unless user.status == 200
    @private = 1
    @auth_scope_private = github_authenticated? :private
    @user = user.body
    if logged_in? && current_user.login == params[:user]
      @repos = huboard.all_repos.select {|r| r['private'] }
    else
      @repos = huboard.all_repos.select {|r| r['private'] && r['owner']['login'].casecmp(params[:user]) == 0 }
    end
    render :index

  end
  :protected
    def login
      github_authenticate! :private
    end

end
