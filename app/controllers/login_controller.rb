class LoginController < ApplicationController
  layout false

  def logout
    warden.logout
    redirect_to "/"
  end
  
  def public
    github_authenticate! :public
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/dashboard"
  end

  def private
    github_authenticate! :private
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/dashboard"
  end

  def github
    github_authenticate! :default
    redirect_to params[:redirect_to] || "/dashboard"
  end

  def github_callback
    warden.authenticate!(scope: session[:scope].to_sym)
  end

  private
  def warden
    env['warden']
  end

end
